import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssessmentService } from '@/lib/services/assessmentService';

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, responses } = await request.json();

    // Validate input
    if (!assessmentId || !responses) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID and responses are required' },
        { status: 400 }
      );
    }

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Store responses in database
    const responsePromises = Object.entries(responses).map(([questionId, response]) =>
      prisma.assessmentResponse.upsert({
        where: {
          assessmentId_questionId: {
            assessmentId,
            questionId
          }
        },
        update: {
          response: response as number
        },
        create: {
          assessmentId,
          questionId,
          response: response as number
        }
      })
    );

    await Promise.all(responsePromises);

    // Calculate scores using AssessmentService
    const oceanScores = await AssessmentService.calculateOCEANScores(responses);
    const cultureScores = await AssessmentService.calculateCultureScores(responses);
    const valuesScores = await AssessmentService.calculateValuesScores(responses);

    // Store assessment results
    const result = await prisma.assessmentResult.upsert({
      where: { assessmentId },
      update: {
        // OCEAN Scores
        openness: oceanScores.openness,
        conscientiousness: oceanScores.conscientiousness,
        extraversion: oceanScores.extraversion,
        agreeableness: oceanScores.agreeableness,
        neuroticism: oceanScores.neuroticism,
        
        // Culture Scores
        powerDistance: cultureScores.powerDistance,
        individualism: cultureScores.individualism,
        masculinity: cultureScores.masculinity,
        uncertaintyAvoidance: cultureScores.uncertaintyAvoidance,
        longTermOrientation: cultureScores.longTermOrientation,
        indulgence: cultureScores.indulgence,
        
        // Values Scores
        innovation: valuesScores.innovation,
        collaboration: valuesScores.collaboration,
        autonomy: valuesScores.autonomy,
        quality: valuesScores.quality,
        customerFocus: valuesScores.customerFocus,
      },
      create: {
        assessmentId,
        // OCEAN Scores
        openness: oceanScores.openness,
        conscientiousness: oceanScores.conscientiousness,
        extraversion: oceanScores.extraversion,
        agreeableness: oceanScores.agreeableness,
        neuroticism: oceanScores.neuroticism,
        
        // Culture Scores
        powerDistance: cultureScores.powerDistance,
        individualism: cultureScores.individualism,
        masculinity: cultureScores.masculinity,
        uncertaintyAvoidance: cultureScores.uncertaintyAvoidance,
        longTermOrientation: cultureScores.longTermOrientation,
        indulgence: cultureScores.indulgence,
        
        // Values Scores
        innovation: valuesScores.innovation,
        collaboration: valuesScores.collaboration,
        autonomy: valuesScores.autonomy,
        quality: valuesScores.quality,
        customerFocus: valuesScores.customerFocus,
      }
    });

    // Update assessment status to completed
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Generate AI recommendations
    let recommendations;
    try {
      const aiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oceanScores,
          cultureScores,
          valuesScores
        })
      });
      
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        recommendations = aiResult.recommendations;
      } else {
        throw new Error('AI service failed');
      }
    } catch (error) {
      console.error('AI recommendations failed, using fallback:', error);
      // Use fallback recommendations
      recommendations = {
        ocean: {
          context: "Based on your OCEAN personality profile, here are some general recommendations for personal and professional development.",
          recommendations: [
            {
              title: "Focus on Personal Growth",
              description: "Consider areas where you can develop further based on your personality strengths and areas for improvement.",
              nextSteps: ["Set specific goals", "Seek feedback", "Practice new behaviors"]
            }
          ]
        },
        culture: {
          context: "Your cultural preferences suggest how you might work best in different organizational environments.",
          recommendations: [
            {
              title: "Find Your Cultural Fit",
              description: "Look for work environments that align with your cultural preferences and values.",
              nextSteps: ["Research company cultures", "Ask about work environment", "Consider cultural alignment"]
            }
          ]
        },
        values: {
          context: "Your work values indicate what motivates and drives you in professional settings.",
          recommendations: [
            {
              title: "Align Work with Values",
              description: "Seek opportunities that align with your core work values and priorities.",
              nextSteps: ["Identify value-aligned roles", "Communicate your values", "Seek value-driven organizations"]
            }
          ]
        }
      };
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      resultId: result.id,
      scores: {
        oceanScores,
        cultureScores,
        valuesScores
      },
      recommendations
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
