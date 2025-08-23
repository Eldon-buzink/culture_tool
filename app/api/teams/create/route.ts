import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { name, description, memberEmails } = await request.json();

    // Validate input
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create default team leader user
    const creator = await prisma.user.create({
      data: {
        name: 'Team Leader',
        email: `team-leader-${Date.now()}@temp.com`
      }
    });

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

    // Create the team
    const newTeam = await prisma.team.create({
      data: {
        name,
        description: description || '',
        code: teamCode,
      },
    });

    // Add creator as first member
    await prisma.teamMember.create({
      data: {
        teamId: newTeam.id,
        userId: creator.id,
        role: 'owner',
        joinedAt: new Date(),
      },
    });

    // Add other members
    if (memberEmails && memberEmails.length > 0) {
      for (const email of memberEmails) {
        if (email && email.trim() && email.includes('@')) {
          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email: email.trim() },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email.trim(),
                name: email.split('@')[0], // Use email prefix as name
              },
            });
          }

          // Add member
          await prisma.teamMember.create({
            data: {
              teamId: newTeam.id,
              userId: user.id,
              role: 'member',
              joinedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      team: {
        id: newTeam.id,
        name: newTeam.name,
        code: newTeam.code,
        description: newTeam.description
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
