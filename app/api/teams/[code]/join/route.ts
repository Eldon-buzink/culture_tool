import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TeamService } from '@/lib/services/teamService';

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { name, email } = await request.json();
    const teamCode = params.code;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create or get user first
    const userResponse = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    const userData = await userResponse.json();
    
    // Join team using TeamService
    const result = await TeamService.joinTeam(teamCode, userData.user.id);

    // Get team info
    const team = await TeamService.getTeamByCode(teamCode);
    
    // Create assessment for the user
    const assessmentResponse = await fetch('/api/assessments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: userData.user.id,
        teamId: team?.id 
      })
    });
    
    const assessmentData = await assessmentResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      user: result.user,
      team: team,
      assessmentId: assessmentData.assessmentId
    });
  } catch (error) {
    console.error('Error joining team:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('already a member')) {
        return NextResponse.json(
          { success: false, error: 'Already a member of this team' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to join team' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const teamCode = params.code;

    // Get team info using TeamService
    const team = await TeamService.getTeamByCode(teamCode);

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        code: team.code
      }
    });
  } catch (error) {
    console.error('Error getting team info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get team info' },
      { status: 500 }
    );
  }
}
