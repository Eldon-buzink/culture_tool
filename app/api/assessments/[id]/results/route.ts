import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { AIService } from '@/lib/services/aiService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;
    const { oceanScores, cultureScores, valuesScores, insights } = await request.json();

    const admin = createSupabaseAdmin();

    // Validate assessment exists
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select('id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Generate AI recommendations
    let aiRecommendations;
    try {
      aiRecommendations = await AIService.generateRecommendations({
        ocean: oceanScores,
        culture: cultureScores,
        values: valuesScores
      });
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      // Use fallback recommendations if AI fails
      aiRecommendations = AIService.getFallbackRecommendations({
        ocean: oceanScores,
        culture: cultureScores,
        values: valuesScores
      });
    }

    // Save assessment results with AI-generated recommendations
    const { data: result, error: resultError } = await admin
      .from('assessment_results')
      .insert({
        assessment_id: assessmentId,
        ocean_scores: oceanScores,
        culture_scores: cultureScores,
        values_scores: valuesScores,
        insights: insights,
        recommendations: aiRecommendations
      })
      .select('id')
      .single();

    if (resultError) {
      console.error('Error saving assessment results:', resultError);
      return NextResponse.json(
        { success: false, error: 'Failed to save assessment results' },
        { status: 500 }
      );
    }

    // Update assessment status to completed
    const { error: updateError } = await admin
      .from('assessments')
      .update({ status: 'completed' })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating assessment status:', updateError);
    }

    return NextResponse.json({ 
      success: true, 
      resultId: result.id,
      recommendations: aiRecommendations
    });
  } catch (error) {
    console.error('Error storing assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store assessment results' },
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
    console.log('GET assessment results - Assessment ID:', id);
    
    if (!id) {
      console.log('No assessment ID provided');
      return NextResponse.json(
        { success: false, error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();
    console.log('Supabase admin client created');

    // First check if the assessment exists and get user info
    console.log('Checking if assessment exists...');
    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select(`
        id,
        user_id,
        users(email)
      `)
      .eq('id', id)
      .single();
    
    console.log('Assessment query result:', { assessment, assessmentError });
    
    if (assessmentError || !assessment) {
      console.log('Assessment not found:', assessmentError);
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    console.log('Assessment found, looking for results...');

    // Get the results
    const { data: results, error: resultsError } = await admin
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', id)
      .single();
    
    console.log('Results query result:', { results, resultsError });
    
    if (resultsError || !results) {
      console.log('Results not found:', resultsError);
      return NextResponse.json(
        { success: false, error: 'Results not found for this assessment' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      results: {
        id: results.id,
        assessmentId: results.assessment_id,
        oceanScores: results.ocean_scores,
        cultureScores: results.culture_scores,
        valuesScores: results.values_scores,
        insights: results.insights,
        recommendations: results.recommendations,
        createdAt: results.created_at,
        userEmail: assessment.users?.[0]?.email || null
      }
    });

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch assessment results: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
