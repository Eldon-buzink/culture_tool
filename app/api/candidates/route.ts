import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createSupabaseAdmin();

    let query = supabase
      .from('candidates')
      .select(`
        id,
        name,
        email,
        position,
        team_code,
        status,
        invited_at,
        started_at,
        completed_at,
        assessment_id,
        overall_fit_score,
        ocean_scores,
        culture_scores,
        values_scores,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by team if specified
    if (teamCode) {
      query = query.eq('team_code', teamCode);
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    const { data: candidates, error } = await query;

    if (error) {
      console.error('Error fetching candidates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      );
    }

    // Transform the data to match our expected format
    const transformedCandidates = candidates?.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,
      teamCode: candidate.team_code,
      status: candidate.status,
      invitedAt: candidate.invited_at,
      startedAt: candidate.started_at,
      completedAt: candidate.completed_at,
      assessmentId: candidate.assessment_id,
      overallFit: candidate.overall_fit_score,
      scores: {
        ocean: candidate.ocean_scores || {},
        culture: candidate.culture_scores || {},
        values: candidate.values_scores || {}
      },
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      candidates: transformedCandidates,
      pagination: {
        limit,
        offset,
        total: transformedCandidates.length
      }
    });

  } catch (error) {
    console.error('Error in candidates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, position, teamCode, invitedBy } = body;

    // Validate required fields
    if (!name || !email || !position || !teamCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, position, teamCode' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Check if candidate already exists for this team
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', email)
      .eq('team_code', teamCode)
      .single();

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate already exists for this team' },
        { status: 409 }
      );
    }

    // Create new candidate
    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert({
        name,
        email,
        position,
        team_code: teamCode,
        status: 'invited',
        invited_by: invitedBy,
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating candidate:', error);
      return NextResponse.json(
        { error: 'Failed to create candidate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        position: candidate.position,
        teamCode: candidate.team_code,
        status: candidate.status,
        invitedAt: candidate.invited_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
