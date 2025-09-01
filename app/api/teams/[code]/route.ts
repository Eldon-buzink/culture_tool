import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Team code is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // Get team by code
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('*')
      .eq('code', code)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get team members
    const { data: teamMembers, error: membersError } = await admin
      .from('team_members')
      .select(`
        *,
        users:user_id(id, name, email),
        teams:team_id(id, name, code)
      `)
      .eq('team_id', team.id);

    if (membersError) {
      console.error('Error fetching team members:', membersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Check completion status for each member and collect scores
    const membersWithStatus = await Promise.all(
      teamMembers.map(async (member) => {
        // Check if this user has any assessments (individual or team)
        const { data: userAssessment } = await admin
          .from('assessments')
          .select(`
            *,
            assessment_results(id)
          `)
          .eq('user_id', member.user_id)
          .or(`team_id.eq.${team.id},team_id.is.null`)
          .single();

        let status: 'invited' | 'completed' | 'in_progress' = 'invited';
        
        if (userAssessment?.assessment_results && userAssessment.assessment_results.length > 0) {
          status = 'completed';
        } else if (userAssessment && userAssessment.status === 'completed') {
          status = 'completed';
        } else if (userAssessment) {
          status = 'in_progress';
        }

        return {
          id: member.user_id,
          name: member.users?.name || 'Unknown',
          email: member.users?.email || 'Unknown',
          role: member.role,
          joinedAt: member.joined_at,
          status: status
        };
      })
    );

    // Calculate aggregate scores from completed assessments
    const completedMembers = membersWithStatus.filter(member => member.status === 'completed');
    
    let aggregateScores = {
      ocean: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
      culture: { hierarchy: 0, egalitarian: 0, individualistic: 0, collectivistic: 0 },
      values: { innovation: 0, quality: 0, efficiency: 0, collaboration: 0 }
    };

    if (completedMembers.length > 0) {
      // Fetch assessment results for completed members
      const { data: assessmentResults } = await admin
        .from('assessment_results')
        .select('ocean_scores, culture_scores, values_scores')
        .in('user_id', completedMembers.map(m => m.id));

      if (assessmentResults && assessmentResults.length > 0) {
        // Calculate averages
        const totalScores = assessmentResults.reduce((acc, result) => {
          if (result.ocean_scores) {
            Object.keys(result.ocean_scores).forEach(key => {
              acc.ocean[key] = (acc.ocean[key] || 0) + result.ocean_scores[key];
            });
          }
          if (result.culture_scores) {
            Object.keys(result.culture_scores).forEach(key => {
              acc.culture[key] = (acc.culture[key] || 0) + result.culture_scores[key];
            });
          }
          if (result.values_scores) {
            Object.keys(result.values_scores).forEach(key => {
              acc.values[key] = (acc.values[key] || 0) + result.values_scores[key];
            });
          }
          return acc;
        }, { ocean: {}, culture: {}, values: {} });

        // Calculate averages
        Object.keys(totalScores.ocean).forEach(key => {
          aggregateScores.ocean[key] = Math.round(totalScores.ocean[key] / assessmentResults.length);
        });
        Object.keys(totalScores.culture).forEach(key => {
          aggregateScores.culture[key] = Math.round(totalScores.culture[key] / assessmentResults.length);
        });
        Object.keys(totalScores.values).forEach(key => {
          aggregateScores.values[key] = Math.round(totalScores.values[key] / assessmentResults.length);
        });
      }
    }

    // Transform the data to match the expected format
    const transformedTeam = {
      id: team.id,
      name: team.name,
      code: team.code,
      description: team.description,
      createdAt: team.created_at,
      members: membersWithStatus,
      aggregateScores: aggregateScores,
      invitations: [] // We'll add this later when we implement invitations
    };

    return NextResponse.json({
      success: true,
      team: transformedTeam
    });

  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
