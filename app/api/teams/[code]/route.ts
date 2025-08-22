import { NextRequest, NextResponse } from 'next/server';
import { getTeamByCode } from '@/lib/data-service';

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

    const team = await getTeamByCode(code);
    
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedTeam = {
      id: team.id,
      name: team.name,
      code: team.code,
      description: team.description,
      createdAt: team.createdAt,
      members: team.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        joinedAt: member.joinedAt,
        status: 'completed' // For now, we'll assume all members have completed
      })),
      assessments: team.assessments.map(assessment => ({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.createdAt,
        results: assessment.results
      })),
      invitations: [] // We'll add this later when we implement invitations
    };

    return NextResponse.json({
      success: true,
      team: transformedTeam
    });

  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
