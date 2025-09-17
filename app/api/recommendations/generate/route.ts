import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const scores = await request.json();
    
    // Validate input
    if (!scores || typeof scores !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid scores data' },
        { status: 400 }
      );
    }

    // Generate AI recommendations in hybrid format
    const recommendations = await AIService.generateHybridIndividualRecommendations(scores);
    
    return NextResponse.json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Return fallback recommendations if AI fails
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate AI recommendations',
        recommendations: AIService.getFallbackIndividualRecommendations(scores)
      },
      { status: 500 }
    );
  }
}
