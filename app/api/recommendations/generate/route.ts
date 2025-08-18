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

    // Generate AI recommendations
    const recommendations = await AIService.generateRecommendations(scores);
    
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
        recommendations: {
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
        }
      },
      { status: 500 }
    );
  }
}
