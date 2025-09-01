import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const supabase = createClient();
    const { candidateId } = params;

    // Fetch candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select(`
        id,
        name,
        email,
        position,
        team_code,
        assessment_id,
        completed_at,
        ocean_scores,
        culture_scores,
        values_scores
      `)
      .eq('id', candidateId)
      .single();

    if (candidateError) {
      console.error('Error fetching candidate:', candidateError);
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedCandidate = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,
      teamCode: candidate.team_code,
      assessmentId: candidate.assessment_id,
      completedAt: candidate.completed_at,
      scores: {
        ocean: candidate.ocean_scores || {},
        culture: candidate.culture_scores || {},
        values: candidate.values_scores || {}
      }
    };

    return NextResponse.json(transformedCandidate);
  } catch (error) {
    console.error('Error in candidate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
