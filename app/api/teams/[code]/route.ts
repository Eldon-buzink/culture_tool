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
        
        // Check if assessment exists and has results
        if (userAssessment) {
          if (userAssessment.status === 'completed') {
            status = 'completed';
          } else if (userAssessment.status === 'in_progress') {
            status = 'in_progress';
          }
          
          // Also check if there are assessment results
          if (userAssessment.assessment_results && userAssessment.assessment_results.length > 0) {
            status = 'completed';
          }
        }

        // If completed, fetch the actual scores
        let oceanScores, cultureScores, valuesScores;
        if (status === 'completed') {
          const { data: results } = await admin
            .from('assessment_results')
            .select('ocean_scores, culture_scores, values_scores')
            .eq('user_id', member.user_id)
            .single();
          
          if (results) {
            oceanScores = results.ocean_scores;
            cultureScores = results.culture_scores;
            valuesScores = results.values_scores;
          }
        }

        return {
          id: member.user_id,
          name: member.users?.name || 'Unknown',
          email: member.users?.email || 'Unknown',
          role: member.role,
          joinedAt: member.joined_at,
          status: status,
          oceanScores,
          cultureScores,
          valuesScores
        };
      })
    );

    // Calculate aggregate scores from completed assessments
    const completedMembers = membersWithStatus.filter(member => member.status === 'completed');
    
    let aggregateScores: any = {
      ocean: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
      culture: { powerDistance: 0, individualism: 0, masculinity: 0, uncertaintyAvoidance: 0, longTermOrientation: 0, indulgence: 0 },
      values: { innovation: 0, collaboration: 0, autonomy: 0, quality: 0, customerFocus: 0 }
    };

    if (completedMembers.length > 0) {
      // Fetch assessment results for completed members
      const { data: assessmentResults } = await admin
        .from('assessment_results')
        .select('ocean_scores, culture_scores, values_scores')
        .in('user_id', completedMembers.map(m => m.id));

      if (assessmentResults && assessmentResults.length > 0) {
        // Calculate averages
        const totalScores = assessmentResults.reduce((acc: any, result: any) => {
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
        }, { ocean: {} as Record<string, number>, culture: {} as Record<string, number>, values: {} as Record<string, number> });

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

    // Generate team insights based on aggregate scores
    const insights = {
      strengths: [] as string[],
      challenges: [] as string[],
      opportunities: [] as string[]
    };

    if (completedMembers.length > 0) {
      // Analyze OCEAN scores
      const oceanScores = aggregateScores.ocean;
      if (oceanScores.openness > 70) insights.strengths.push("High creativity and adaptability");
      if (oceanScores.conscientiousness > 70) insights.strengths.push("Strong organization and planning");
      if (oceanScores.agreeableness > 70) insights.strengths.push("Excellent teamwork and collaboration");
      if (oceanScores.extraversion > 70) insights.strengths.push("Strong communication and social skills");
      if (oceanScores.neuroticism < 30) insights.strengths.push("Emotional stability and stress resilience");

      // Analyze culture scores
      const cultureScores = aggregateScores.culture;
      if (cultureScores.powerDistance < 40) insights.strengths.push("Egalitarian work environment");
      if (cultureScores.individualism > 60) insights.strengths.push("Strong individual initiative");
      if (cultureScores.uncertaintyAvoidance < 50) insights.strengths.push("Comfort with change and innovation");

      // Analyze values scores
      const valuesScores = aggregateScores.values;
      if (valuesScores.innovation > 70) insights.strengths.push("Innovation-focused culture");
      if (valuesScores.quality > 70) insights.strengths.push("Quality-driven approach");
      if (valuesScores.collaboration > 70) insights.strengths.push("Collaborative work style");

      // Identify challenges
      if (oceanScores.openness < 40) insights.challenges.push("May resist new approaches");
      if (oceanScores.conscientiousness < 40) insights.challenges.push("Process discipline needs improvement");
      if (cultureScores.powerDistance > 70) insights.challenges.push("Hierarchical decision-making may slow innovation");

      // Identify opportunities
      if (oceanScores.openness > 60 && oceanScores.conscientiousness > 60) {
        insights.opportunities.push("Balance creativity with structure");
      }
      if (cultureScores.individualism > 50 && cultureScores.uncertaintyAvoidance < 50) {
        insights.opportunities.push("Leverage individual initiative for innovation");
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
      insights: insights,
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
