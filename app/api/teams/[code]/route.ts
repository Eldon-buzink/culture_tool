import { NextRequest, NextResponse } from 'next/server';
import { getTeamByCode } from '@/lib/data-service';
import { prisma } from '@/lib/database';

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

    // Check completion status for each member
    const membersWithStatus = await Promise.all(
      team.members.map(async (member) => {
        // Check if this user has any assessments (individual or team)
        const userAssessment = await prisma.assessment.findFirst({
          where: {
            createdBy: member.user.id
          },
          include: {
            results: true
          }
        });

        let status: 'invited' | 'completed' | 'in_progress' = 'invited';
        
        if (userAssessment?.results) {
          status = 'completed';
        } else if (userAssessment && userAssessment.status === 'completed') {
          status = 'completed';
        } else if (userAssessment) {
          status = 'in_progress';
        }

        console.log(`Member ${member.user.email} status: ${status}`, {
          hasAssessment: !!userAssessment,
          hasResults: !!userAssessment?.results,
          assessmentStatus: userAssessment?.status,
          assessmentType: userAssessment?.type
        });

        return {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt,
          status: status,
          completedAt: userAssessment?.results?.completedAt
        };
      })
    );

    // Transform the data to match the expected format
    const transformedTeam = {
      id: team.id,
      name: team.name,
      code: team.code,
      description: team.description,
      createdAt: team.createdAt,
      members: membersWithStatus,
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

    console.log('Final transformed team data:', {
      memberCount: transformedTeam.members.length,
      memberStatuses: transformedTeam.members.map(m => ({ email: m.email, status: m.status }))
    });

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
