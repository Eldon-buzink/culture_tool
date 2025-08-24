import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const admin = createSupabaseAdmin();

    // Verify user exists
    const { data: user, error: userError } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify team exists if teamId is provided
    if (teamId) {
      const { data: team, error: teamError } = await admin
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
    }

    // Create new assessment
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .insert({
        user_id: userId,
        team_id: teamId || null,
        status: 'in_progress'
      })
      .select('id')
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create assessment' },
        { status: 500 }
      );
    }

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
