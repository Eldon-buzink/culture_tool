import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');
    
    if (!teamCode) {
      return NextResponse.json(
        { success: false, error: 'Team code is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // First, get the team ID from the team code
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('id')
      .eq('code', teamCode)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Look for assessments linked to this team that are in 'invited' or 'in_progress' status
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select('id, status, user_id, team_id')
      .eq('team_id', team.id)
      .in('status', ['invited', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (assessmentError) {
      // No assessment found, which is fine
      return NextResponse.json({
        success: true,
        assessment: null
      });
    }

    return NextResponse.json({
      success: true,
      assessment: assessment
    });

  } catch (error) {
    console.error('Error finding team assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
