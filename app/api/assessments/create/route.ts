import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

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

    // Check for recent duplicate assessments (within last 30 seconds)
    // Only check if createdBy is an actual UUID, not a temporary session ID
    if (createdBy && !createdBy.startsWith('session-') && !createdBy.startsWith('individual-') && !createdBy.startsWith('team-invite-')) {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      const { data: recentAssessments, error: recentError } = await admin
        .from('assessments')
        .select('id, created_at')
        .eq('user_id', createdBy)
        .gte('created_at', thirtySecondsAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentError) {
        console.error('Error checking for recent assessments:', recentError);
      } else if (recentAssessments && recentAssessments.length > 0) {
        console.log('Found recent assessment, preventing duplicate:', recentAssessments[0]);
        return NextResponse.json(
          { success: false, error: 'Assessment already created recently' },
          { status: 409 }
        );
      }
    }

    // For individual assessments, create a user if it's a session ID or individual ID
    let userId = createdBy;
    if (createdBy.startsWith('session-') || createdBy.startsWith('individual-')) {
      // This is a session-based or individual user, create a temporary user record
      // Use timestamp + random UUID to ensure uniqueness
      const uniqueEmail = `${createdBy}-${Date.now()}-${randomUUID().slice(0, 8)}@temp.local`;
      
      const { data: newUser, error: userError } = await admin
        .from('users')
        .insert({
          email: uniqueEmail,
          name: 'Individual Assessment User'
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Error creating individual user:', userError);
        return NextResponse.json(
          { success: false, error: 'Failed to create individual user' },
          { status: 500 }
        );
      }
      userId = newUser.id;
    } else if (createdBy.startsWith('team-invite-')) {
      // This is a team invitation, create a temporary user record
      const { data: newUser, error: userError } = await admin
        .from('users')
        .insert({
          email: `${createdBy}@team.local`,
          name: 'Team Assessment User'
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Error creating team user:', userError);
        return NextResponse.json(
          { success: false, error: 'Failed to create team user' },
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

    // Handle team ID - if teamId is a team code, look up the actual team ID
    let actualTeamId = teamId;
    if (teamId && !teamId.includes('-')) {
      // This looks like a team code, not a UUID
      console.log('Looking up team ID for team code:', teamId);
      const { data: team, error: teamError } = await admin
        .from('teams')
        .select('id')
        .eq('code', teamId)
        .single();

      if (teamError || !team) {
        console.error('Team not found for code:', teamId, teamError);
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
      actualTeamId = team.id;
      console.log('Found team ID:', actualTeamId, 'for team code:', teamId);
    }

    // Verify team exists if teamId is provided
    if (actualTeamId) {
      const { data: team, error: teamError } = await admin
        .from('teams')
        .select('id')
        .eq('id', actualTeamId)
        .single();

      if (teamError || !team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
    }

    // Create new assessment
    const assessmentData = {
      user_id: userId,
      team_id: actualTeamId || null,
      status: 'in_progress'
    };
    
    console.log('Attempting to create assessment with data:', assessmentData);
    
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .insert(assessmentData)
      .select('*')
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      console.error('Assessment data that failed:', assessmentData);
      return NextResponse.json(
        { success: false, error: 'Failed to create assessment: ' + assessmentError.message },
        { status: 500 }
      );
    }

    console.log('Assessment created successfully:', assessment);

    return NextResponse.json({ 
      success: true, 
      assessment: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
