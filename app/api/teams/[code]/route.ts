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

    // Check completion status for each member
    const membersWithStatus = await Promise.all(
      teamMembers.map(async (member) => {
        // Check if this user has any assessments
        const { data: userAssessment } = await admin
          .from('assessments')
          .select(`
            *,
            assessment_results(id)
          `)
          .eq('user_id', member.user_id)
          .eq('team_id', team.id)
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

    // Transform the data to match the expected format
    const transformedTeam = {
      id: team.id,
      name: team.name,
      code: team.code,
      description: team.description,
      createdAt: team.created_at,
      members: membersWithStatus,
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
