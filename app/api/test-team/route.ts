import { NextResponse } from 'next/server';
import { getTeamByCode } from '@/lib/data-service';

export async function GET() {
  try {
    // Test with the known team code
    const team = await getTeamByCode('GG5NU1');
    
    if (!team) {
      return NextResponse.json({
        success: false,
        error: 'Team not found',
        searchedCode: 'GG5NU1'
      });
    }
    
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
    console.error('Team lookup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Team lookup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
