import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // First, get or create a user
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    }

    // Create a team directly
    const team = await prisma.team.create({
      data: {
        name: 'Direct Test Team',
        code: 'TEST123',
        description: 'A test team created directly',
        members: {
          create: {
            userId: user.id,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        memberCount: team.members.length
      }
    });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Team creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
