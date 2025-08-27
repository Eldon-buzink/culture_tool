import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: assessmentId } = params;
    const { responses, results } = await request.json();
    
    if (!responses || !results) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // First, check if the assessment exists
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select('id, user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment not found:', assessmentId, assessmentError);
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Store assessment results
    const { error: resultsError } = await admin
      .from('assessment_results')
      .upsert({
        assessment_id: assessmentId,
        ocean_scores: results.oceanScores
      }, {
        onConflict: 'assessment_id'
      });

    if (resultsError) {
      console.error('Error storing results:', resultsError);
      return NextResponse.json(
        { success: false, error: 'Failed to store assessment results' },
        { status: 500 }
      );
    }

    // Store individual responses
    for (const [section, sectionResponses] of Object.entries(responses)) {
      for (const [questionId, response] of Object.entries(sectionResponses as Record<string, number>)) {
        try {
          await admin
            .from('assessment_responses')
            .upsert({
              assessment_id: assessmentId,
              user_id: assessment.user_id,
              question_id: questionId,
              response: response
            }, {
              onConflict: 'assessment_id,question_id'
            });
        } catch (error) {
          console.error('Error storing response:', error);
          // Continue with other responses even if one fails
        }
      }
    }

    // Update assessment status to completed
    const { error: updateError } = await admin
      .from('assessments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating assessment status:', updateError);
      // Don't fail the whole operation for this
    }

    console.log('Successfully stored assessment results:', assessmentId);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment results stored successfully'
    });

  } catch (error) {
    console.error('Error storing assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store assessment results' },
      { status: 500 }
    );
  }
}
