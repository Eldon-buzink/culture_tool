import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TeamService } from '@/lib/services/teamService';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const teamCode = params.code;

    // Get team dashboard data using TeamService
    const dashboardData = await TeamService.getTeamDashboardData(teamCode);

    if (!dashboardData) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Error getting team dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get team dashboard' },
      { status: 500 }
    );
  }
}
