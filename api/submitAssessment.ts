import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateOCEANScores } from '@/lib/traits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, answers, participantId } = body;

    if (!assessmentId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Assessment ID and answers are required' },
        { status: 400 }
      );
    }

    // Verify assessment exists
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate OCEAN scores
    const scores = calculateOCEANScores(answers, assessment.questions);

    // Save assessment submission
    const submission = await db.assessmentSubmission.create({
      data: {
        assessmentId,
        participantId: participantId || 'anonymous',
        answers: answers as Record<string, number>,
        scores,
        completedAt: new Date(),
      },
    });

    // Generate insights and recommendations
    const insights = await generateInsights(scores);
    const recommendations = await generateRecommendations(scores);

    // Update submission with insights
    await db.assessmentSubmission.update({
      where: { id: submission.id },
      data: {
        insights,
        recommendations,
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        scores,
        insights,
        recommendations,
        completedAt: submission.completedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

async function generateInsights(scores: Record<string, number>): Promise<string[]> {
  const insights = [];

  if (scores.openness > 70) {
    insights.push('High openness indicates adaptability and creativity');
  } else if (scores.openness < 40) {
    insights.push('Lower openness suggests preference for routine and structure');
  }

  if (scores.conscientiousness > 70) {
    insights.push('High conscientiousness shows strong organization and reliability');
  }

  if (scores.extraversion > 70) {
    insights.push('High extraversion indicates strong social engagement');
  } else if (scores.extraversion < 40) {
    insights.push('Lower extraversion suggests preference for focused individual work');
  }

  if (scores.agreeableness > 70) {
    insights.push('High agreeableness indicates strong collaboration potential');
  }

  if (scores.neuroticism > 60) {
    insights.push('Consider stress management strategies for better well-being');
  }

  return insights;
}

async function generateRecommendations(scores: Record<string, number>): Promise<Array<{
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}>> {
  const recommendations = [];

  if (scores.openness < 50) {
    recommendations.push({
      id: '1',
      title: 'Encourage Innovation',
      description: 'Create opportunities for creative problem-solving',
      priority: 'medium',
    });
  }

  if (scores.conscientiousness < 60) {
    recommendations.push({
      id: '2',
      title: 'Improve Organization',
      description: 'Implement structured workflows and clear deadlines',
      priority: 'high',
    });
  }

  if (scores.extraversion < 50) {
    recommendations.push({
      id: '3',
      title: 'Enhance Communication',
      description: 'Establish regular check-ins and feedback sessions',
      priority: 'medium',
    });
  }

  if (scores.neuroticism > 60) {
    recommendations.push({
      id: '4',
      title: 'Stress Management',
      description: 'Provide stress management resources and support',
      priority: 'high',
    });
  }

  return recommendations;
}
