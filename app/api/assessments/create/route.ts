import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { title, description, type, createdBy, teamId } = await request.json();
    
    // Validate input
    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: 'Created by field is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // For individual assessments, create a user if it's a session ID
    let userId = createdBy;
    if (createdBy.startsWith('session-')) {
      // This is a session-based user, create a temporary user record
      const { data: newUser, error: userError } = await admin
        .from('users')
        .insert({
          email: `${createdBy}@temp.local`,
          name: 'Individual Assessment User'
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Error creating session user:', userError);
        return NextResponse.json(
          { success: false, error: 'Failed to create session user' },
          { status: 500 }
        );
      }
      userId = newUser.id;
    } else {
      // Verify existing user exists
      const { data: user, error: userError } = await admin
        .from('users')
        .select('id')
        .eq('id', createdBy)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
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
        title: title || 'Individual Assessment',
        description: description || 'Personal assessment for individual insights',
        type: type || 'individual',
        user_id: userId,
        team_id: teamId || null,
        status: 'completed'
      })
      .select('*')
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
      assessment: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
