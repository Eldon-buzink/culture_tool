import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TeamService } from '@/lib/services/teamService';

export async function POST(request: NextRequest) {
  try {
    const { name, description, creatorId, memberEmails } = await request.json();

    // Validate input
    if (!name || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Team name and creator ID are required' },
        { status: 400 }
      );
    }

    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Create team using TeamService
    const team = await TeamService.createTeam({
      name,
      description: description || '',
      creatorId,
      memberEmails: memberEmails || []
    });

    return NextResponse.json({ 
      success: true, 
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        description: team.description
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
