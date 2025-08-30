import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, createdBy, teamId } = body;

    if (!title || !type || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .insert({
        title: title,
        description: description || null,
        type: type,
        user_id: createdBy,
        team_id: teamId || null,
        status: 'draft'
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
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.created_at
      }
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select(`
        *,
        teams:team_id(id, name, code),
        users:user_id(id, name, email)
      `)
      .eq('id', id)
      .single();
    
    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.created_at,
        team: assessment.teams,
        user: assessment.users
      }
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
