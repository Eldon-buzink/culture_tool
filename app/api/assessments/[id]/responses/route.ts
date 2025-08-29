import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, section, questionId, response } = body;

    if (!userId || !questionId || response === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // Validate assessment exists
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select('id')
      .eq('id', id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Save the response (assessment_responses table only has assessment_id, question_id, response)
    const { data: savedResponse, error: responseError } = await admin
      .from('assessment_responses')
      .upsert({
        assessment_id: id,
        question_id: questionId,
        response: response
      }, {
        onConflict: 'assessment_id,question_id'
      })
      .select('*')
      .single();

    if (responseError) {
      console.error('Error saving response:', responseError);
      return NextResponse.json(
        { success: false, error: 'Failed to save response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: savedResponse
    });

  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    const { data: responses, error: responsesError } = await admin
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', id);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      responses: responses || []
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
