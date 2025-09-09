import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { scores, memberCount, section } = await request.json();

    if (!scores || !memberCount || !section) {
      return NextResponse.json(
        { success: false, error: 'Scores, member count, and section are required' },
        { status: 400 }
      );
    }

    // Generate AI insights using the existing AIService
    const aiInsights = await AIService.generateTeamInsights(scores, memberCount);
    
    // Parse the AI response into bullet points
    const insights = parseAIInsights(aiInsights, section);

    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}

function parseAIInsights(aiResponse: string, section: string): string[] {
  // Split the AI response into sentences and filter for relevant insights
  const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Filter insights based on section
  let filteredInsights = sentences;
  
  if (section === 'ocean') {
    filteredInsights = sentences.filter(s => 
      s.toLowerCase().includes('personality') || 
      s.toLowerCase().includes('communication') ||
      s.toLowerCase().includes('collaboration') ||
      s.toLowerCase().includes('creativity') ||
      s.toLowerCase().includes('organization') ||
      s.toLowerCase().includes('stress') ||
      s.toLowerCase().includes('extraversion') ||
      s.toLowerCase().includes('openness') ||
      s.toLowerCase().includes('conscientiousness') ||
      s.toLowerCase().includes('agreeableness') ||
      s.toLowerCase().includes('neuroticism')
    );
  } else if (section === 'culture') {
    filteredInsights = sentences.filter(s => 
      s.toLowerCase().includes('culture') || 
      s.toLowerCase().includes('hierarchy') ||
      s.toLowerCase().includes('decision') ||
      s.toLowerCase().includes('power') ||
      s.toLowerCase().includes('individual') ||
      s.toLowerCase().includes('teamwork') ||
      s.toLowerCase().includes('structure') ||
      s.toLowerCase().includes('flexibility')
    );
  } else if (section === 'values') {
    filteredInsights = sentences.filter(s => 
      s.toLowerCase().includes('innovation') || 
      s.toLowerCase().includes('quality') ||
      s.toLowerCase().includes('customer') ||
      s.toLowerCase().includes('autonomy') ||
      s.toLowerCase().includes('collaboration') ||
      s.toLowerCase().includes('values') ||
      s.toLowerCase().includes('work') ||
      s.toLowerCase().includes('focus')
    );
  }
  
  // Take the first 3 relevant insights and clean them up
  return filteredInsights
    .slice(0, 3)
    .map(insight => insight.trim().replace(/^[•\-\*]\s*/, ''))
    .filter(insight => insight.length > 0);
}
