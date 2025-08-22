import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentResults, getAssessmentByUuid, saveAssessmentResults, updateAssessmentStatus } from '@/lib/data-service';
import { AIService } from '@/lib/services/aiService';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;
    const { oceanScores, cultureScores, valuesScores, insights } = await request.json();

    // Validate assessment exists
    const assessment = await getAssessmentByUuid(assessmentId);

    if (!assessment) {
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
    const result = await saveAssessmentResults({
      assessmentId,
      oceanScores,
      cultureScores,
      valuesScores,
      insights,
      recommendations: aiRecommendations
    });

    // Update assessment status to completed
    await updateAssessmentStatus(assessmentId, 'completed');

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
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // First check if the assessment exists
    const assessment = await getAssessmentByUuid(id);
    
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get the results
    const results = await getAssessmentResults(id);
    
    if (!results) {
      return NextResponse.json(
        { success: false, error: 'Results not found for this assessment' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: results,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.createdAt,
        createdBy: assessment.createdBy
      }
    });

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
