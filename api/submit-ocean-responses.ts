import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateOCEANScores, OCEANScores, Question } from '@/lib/traits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, responses } = body;

    if (!uuid || !responses || typeof responses !== 'object') {
      return NextResponse.json(
        { error: 'UUID and responses are required' },
        { status: 400 }
      );
    }

    // Convert responses to the format expected by the traits library
    const questions: Question[] = Object.keys(responses).map(id => ({
      id,
      text: '', // Not needed for scoring
      category: getCategoryFromId(id), // This would need to be determined based on your question mapping
      reverseScored: false, // This would need to be determined based on your question mapping
    }));

    // Calculate OCEAN scores
    const scores = calculateOCEANScores(responses, questions);

    // Save the assessment submission
    const submission = await db.assessmentSubmission.create({
      data: {
        assessmentId: uuid,
        participantId: 'anonymous', // This would come from authentication
        answers: responses,
        scores,
        completedAt: new Date(),
        insights: generateInsights(scores),
        recommendations: generateRecommendations(scores),
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        scores,
        completedAt: submission.completedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting OCEAN responses:', error);
    return NextResponse.json(
      { error: 'Failed to submit responses' },
      { status: 500 }
    );
  }
}

// Helper function to determine category from question ID
// In a real implementation, this would be based on your question mapping
function getCategoryFromId(id: string): keyof OCEANScores {
  const categoryMap: Record<string, keyof OCEANScores> = {
    '1': 'extraversion',
    '2': 'agreeableness',
    '3': 'conscientiousness',
    '4': 'neuroticism',
    '5': 'openness',
    '6': 'extraversion',
    '7': 'agreeableness',
    '8': 'conscientiousness',
    '9': 'neuroticism',
    '10': 'openness',
    '11': 'extraversion',
    '12': 'agreeableness',
    '13': 'conscientiousness',
    '14': 'neuroticism',
    '15': 'openness',
    '16': 'extraversion',
    '17': 'agreeableness',
    '18': 'conscientiousness',
    '19': 'neuroticism',
    '20': 'openness',
  };
  
  return categoryMap[id] || 'openness';
}

function generateInsights(scores: Record<string, number>): string[] {
  const insights = [];

  if (scores.openness > 70) {
    insights.push('High openness indicates creativity and adaptability');
  } else if (scores.openness < 40) {
    insights.push('Lower openness suggests preference for structure and routine');
  }

  if (scores.conscientiousness > 70) {
    insights.push('High conscientiousness shows strong organization and reliability');
  } else if (scores.conscientiousness < 40) {
    insights.push('Lower conscientiousness suggests flexibility and spontaneity');
  }

  if (scores.extraversion > 70) {
    insights.push('High extraversion indicates strong social engagement');
  } else if (scores.extraversion < 40) {
    insights.push('Lower extraversion suggests preference for focused individual work');
  }

  if (scores.agreeableness > 70) {
    insights.push('High agreeableness indicates strong collaboration potential');
  } else if (scores.agreeableness < 40) {
    insights.push('Lower agreeableness suggests directness and assertiveness');
  }

  if (scores.neuroticism < 30) {
    insights.push('Low neuroticism indicates emotional stability and resilience');
  } else if (scores.neuroticism > 70) {
    insights.push('Higher neuroticism suggests sensitivity to stress and emotions');
  }

  return insights;
}

function generateRecommendations(scores: Record<string, number>): Array<{
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations = [];

  if (scores.openness < 50) {
    recommendations.push({
      id: '1',
      title: 'Embrace New Experiences',
      description: 'Consider trying new approaches and creative problem-solving methods',
      priority: 'medium' as const,
    });
  }

  if (scores.conscientiousness < 60) {
    recommendations.push({
      id: '2',
      title: 'Improve Organization',
      description: 'Implement structured workflows and clear deadlines',
      priority: 'high' as const,
    });
  }

  if (scores.extraversion < 50) {
    recommendations.push({
      id: '3',
      title: 'Enhance Communication',
      description: 'Consider more structured communication channels and regular check-ins',
      priority: 'medium' as const,
    });
  }

  if (scores.agreeableness < 50) {
    recommendations.push({
      id: '4',
      title: 'Build Team Collaboration',
      description: 'Focus on building trust and cooperation in team settings',
      priority: 'high' as const,
    });
  }

  if (scores.neuroticism > 60) {
    recommendations.push({
      id: '5',
      title: 'Stress Management',
      description: 'Consider stress management techniques and work-life balance',
      priority: 'high' as const,
    });
  }

  return recommendations;
}
