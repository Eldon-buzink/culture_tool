import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { AIService } from '@/lib/services/aiService';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { teamScores, memberCount } = await request.json();

    if (!teamScores || !memberCount) {
      return NextResponse.json(
        { success: false, error: 'Team scores and member count are required' },
        { status: 400 }
      );
    }

    // Find the team
    const team = await prisma.team.findUnique({
      where: { code }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Generate AI team recommendations
    let teamRecommendations;
    try {
      teamRecommendations = await AIService.generateTeamInsights(teamScores, memberCount);
    } catch (error) {
      console.error('Failed to generate AI team recommendations:', error);
      // Use fallback recommendations if AI fails
      teamRecommendations = {
        strengths: ['Team assessment in progress'],
        challenges: ['Complete individual assessments to see team insights'],
        opportunities: ['Invite team members to participate'],
        summary: 'Team insights are being processed. Please check back later.'
      };
    }

    // Store team recommendations in the database
    await prisma.team.update({
      where: { id: team.id },
      data: {
        teamRecommendations: JSON.stringify(teamRecommendations)
      }
    });

    return NextResponse.json({
      success: true,
      recommendations: teamRecommendations
    });

  } catch (error) {
    console.error('Error generating team recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate team recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    // Find the team
    const team = await prisma.team.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            user: true
          }
        },
        assessments: {
          include: {
            results: true
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if we have stored recommendations
    if (team.teamRecommendations) {
      const storedRecommendations = JSON.parse(team.teamRecommendations);
      return NextResponse.json({
        success: true,
        recommendations: storedRecommendations,
        team: {
          id: team.id,
          name: team.name,
          code: team.code,
          memberCount: team.members.length,
          assessmentCount: team.assessments.length
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Team recommendations need to be generated. Use POST to generate them.',
        team: {
          id: team.id,
          name: team.name,
          code: team.code,
          memberCount: team.members.length,
          assessmentCount: team.assessments.length
        }
      });
    }

  } catch (error) {
    console.error('Error fetching team recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team recommendations' },
      { status: 500 }
    );
  }
}
