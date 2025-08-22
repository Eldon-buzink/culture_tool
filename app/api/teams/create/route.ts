import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

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

    // Generate unique team code
    let teamCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingTeam = await prisma.team.findUnique({
        where: { code: teamCode },
      });
      if (!existingTeam) {
        isUnique = true;
      }
    }

    // Create team and members in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          name,
          description: description || '',
          code: teamCode,
        },
      });

      // Add creator as first member with owner role
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: creatorId,
          role: 'owner',
          joinedAt: new Date(),
        },
      });

      // Add other members
      for (const email of memberEmails || []) {
        // Find or create user
        let user = await tx.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              email,
              name: email.split('@')[0], // Use email prefix as name
            },
          });
        }

        // Add member
        await tx.teamMember.create({
          data: {
            teamId: newTeam.id,
            userId: user.id,
            role: 'member',
            joinedAt: new Date(),
          },
        });
      }

      return newTeam;
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
