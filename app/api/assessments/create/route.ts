import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, teamId } = await request.json();
    
    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify team exists if teamId is provided
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });

      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
    }

    // Create new assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        teamId: teamId || null,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      assessmentId: assessment.id 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
