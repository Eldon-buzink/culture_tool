import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;
    const { oceanScores, cultureScores, valuesScores } = await request.json();

    // Validate assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Store or update assessment results
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

    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    console.error('Error storing assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store assessment results' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;

    // Get assessment results with related data
    const result = await prisma.assessmentResult.findUnique({
      where: { assessmentId },
      include: {
        assessment: {
          include: {
            user: true,
            team: true
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedResult = {
      oceanScores: {
        openness: result.openness,
        conscientiousness: result.conscientiousness,
        extraversion: result.extraversion,
        agreeableness: result.agreeableness,
        neuroticism: result.neuroticism,
      },
      cultureScores: {
        powerDistance: result.powerDistance,
        individualism: result.individualism,
        masculinity: result.masculinity,
        uncertaintyAvoidance: result.uncertaintyAvoidance,
        longTermOrientation: result.longTermOrientation,
        indulgence: result.indulgence,
      },
      valuesScores: {
        innovation: result.innovation,
        collaboration: result.collaboration,
        autonomy: result.autonomy,
        quality: result.quality,
        customerFocus: result.customerFocus,
      },
      user: result.assessment.user,
      team: result.assessment.team,
      completedAt: result.assessment.completedAt
    };

    return NextResponse.json({ success: true, result: formattedResult });
  } catch (error) {
    console.error('Error retrieving assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve assessment results' },
      { status: 500 }
    );
  }
}
