import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, createdBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create team in database
    const team = await db.team.create({
      data: {
        name,
        description: description || '',
        createdBy: createdBy || 'anonymous',
        inviteCode: generateInviteCode(),
      },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        inviteCode: team.inviteCode,
        createdAt: team.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
