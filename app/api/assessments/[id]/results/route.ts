import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;
    const admin = createSupabaseAdmin();

    // Fetch assessment results from database
    const { data: results, error: resultsError } = await admin
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (resultsError || !results) {
      return NextResponse.json(
        { success: false, error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedResults = {
      oceanScores: results.ocean_scores || {},
      cultureScores: results.culture_scores || {},
      valuesScores: results.values_scores || {},
      insights: results.insights || { ocean: [], culture: [], values: [] },
      recommendations: results.recommendations || [],
      userEmail: results.user_email || null
    };

    return NextResponse.json({
      success: true,
      results: transformedResults
    });

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment results' },
      { status: 500 }
    );
  }
}

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

    // Generate AI recommendations in hybrid format
    let aiRecommendations;
    try {
      const { AIService } = await import('@/lib/services/aiService');
      aiRecommendations = await AIService.generateHybridIndividualRecommendations({
        ocean: oceanScores,
        culture: cultureScores,
        values: valuesScores
      });
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      // Use fallback recommendations if AI fails
      const { AIService } = await import('@/lib/services/aiService');
      aiRecommendations = AIService.getFallbackIndividualRecommendations({
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
    console.error('Error processing assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process assessment results' },
      { status: 500 }
    );
  }
}