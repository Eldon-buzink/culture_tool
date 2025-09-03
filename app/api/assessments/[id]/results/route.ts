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

// Helper functions to generate insights and recommendations
function generateOceanInsights(oceanScores: any) {
  try {
    const insights = [];
    
    if (oceanScores && oceanScores.openness > 70) insights.push("You show high openness to new experiences, indicating creativity and adaptability.");
    if (oceanScores && oceanScores.extraversion > 70) insights.push("Your extraversion suggests you thrive in social and collaborative environments.");
    if (oceanScores && oceanScores.conscientiousness > 70) insights.push("High conscientiousness indicates strong organization and planning skills.");
    if (oceanScores && oceanScores.agreeableness > 70) insights.push("Your agreeableness indicates strong teamwork and cooperation skills.");
    if (oceanScores && oceanScores.neuroticism < 30) insights.push("Low neuroticism shows emotional stability and stress resilience.");
    
    return insights.length > 0 ? insights : ["Your personality profile shows a balanced approach to work and collaboration."];
  } catch (error) {
    console.error('Error generating ocean insights:', error);
    return ["Your personality profile shows a balanced approach to work and collaboration."];
  }
}

function generateCultureInsights(cultureScores: any) {
  try {
    const insights = [];
    
    if (cultureScores && cultureScores.powerDistance < 40) insights.push("You prefer egalitarian work environments with low power distance.");
    if (cultureScores && cultureScores.individualism > 60) insights.push("Your individualism indicates you value personal achievement and autonomy.");
    if (cultureScores && cultureScores.uncertaintyAvoidance < 50) insights.push("Your uncertainty avoidance shows comfort with both structure and flexibility.");
    
    return insights.length > 0 ? insights : ["Your cultural preferences show adaptability to different work environments."];
  } catch (error) {
    console.error('Error generating culture insights:', error);
    return ["Your cultural preferences show adaptability to different work environments."];
  }
}

function generateValuesInsights(valuesScores: any) {
  const insights = [];
  
  if (valuesScores.innovation > 70) insights.push("Innovation is a top work value, driving your professional choices.");
  if (valuesScores.collaboration > 70) insights.push("You value collaboration and teamwork in your work.");
  if (valuesScores.quality > 70) insights.push("Quality focus shows your attention to excellence and detail.");
  
  return insights.length > 0 ? insights : ["Your work values show a commitment to delivering quality results."];
}

function generateOceanRecommendations(oceanScores: any) {
  return {
    context: "Based on your OCEAN personality profile, you're naturally inclined toward creative and collaborative work environments.",
    recommendations: [
      {
        title: "Leverage Your Strengths",
        description: "Focus on roles that align with your natural personality traits.",
        nextSteps: [
          "Seek opportunities that match your personality profile",
          "Develop skills that complement your natural strengths",
          "Find work environments that support your preferences"
        ]
      }
    ]
  };
}

function generateCultureRecommendations(cultureScores: any) {
  return {
    context: "Your cultural preferences indicate adaptability to different work environments.",
    recommendations: [
      {
        title: "Cultural Adaptation",
        description: "Use your cultural awareness to work effectively in diverse teams.",
        nextSteps: [
          "Learn about different cultural perspectives",
          "Adapt your communication style as needed",
          "Seek diverse team experiences"
        ]
      }
    ]
  };
}

function generateValuesRecommendations(valuesScores: any) {
  return {
    context: "Your work values guide your professional choices and satisfaction.",
    recommendations: [
      {
        title: "Value-Based Career Planning",
        description: "Align your career choices with your core work values.",
        nextSteps: [
          "Identify roles that match your values",
          "Communicate your values to potential employers",
          "Seek organizations that share your values"
        ]
      }
    ]
  };
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

    // Generate insights and recommendations based on scores
    const insights = {
      ocean: generateOceanInsights(results.ocean_scores || {}),
      culture: generateCultureInsights(results.culture_scores || {}),
      values: generateValuesInsights(results.values_scores || {})
    };

    const recommendations = {
      ocean: generateOceanRecommendations(results.ocean_scores || {}),
      culture: generateCultureRecommendations(results.culture_scores || {}),
      values: generateValuesRecommendations(results.values_scores || {})
    };

    return NextResponse.json({
      success: true,
      results: {
        id: results.id,
        assessmentId: results.assessment_id,
        oceanScores: results.ocean_scores,
        cultureScores: results.culture_scores,
        valuesScores: results.values_scores,
        insights: insights,
        recommendations: recommendations,
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
