import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface AssessmentScores {
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  culture: {
    powerDistance: number;
    individualism: number;
    masculinity: number;
    uncertaintyAvoidance: number;
    longTermOrientation: number;
    indulgence: number;
  };
  values: {
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
  };
}

export interface AIRecommendations {
  ocean: {
    context: string;
    recommendations: Array<{
      title: string;
      description: string;
      nextSteps: string[];
    }>;
  };
  culture: {
    context: string;
    recommendations: Array<{
      title: string;
      description: string;
      nextSteps: string[];
    }>;
  };
  values: {
    context: string;
    recommendations: Array<{
      title: string;
      description: string;
      nextSteps: string[];
    }>;
  };
}

export class AIService {
  static async generateRecommendations(scores: AssessmentScores): Promise<AIRecommendations> {
    try {
      const prompt = this.buildPrompt(scores);
      
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert organizational psychologist and career coach specializing in personality assessments, cultural work preferences, and workplace values. Provide insightful, actionable, and personalized recommendations based on assessment results. Be specific, practical, and encouraging.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getFallbackRecommendations(scores);
    }
  }

  private static buildPrompt(scores: AssessmentScores): string {
    return `
Based on the following assessment results, provide comprehensive insights and recommendations:

OCEAN Personality Scores (0-100):
- Openness: ${scores.ocean.openness}
- Conscientiousness: ${scores.ocean.conscientiousness}
- Extraversion: ${scores.ocean.extraversion}
- Agreeableness: ${scores.ocean.agreeableness}
- Neuroticism: ${scores.ocean.neuroticism}

Cultural Work Preferences (0-100):
- Power Distance: ${scores.culture.powerDistance}
- Individualism: ${scores.culture.individualism}
- Masculinity: ${scores.culture.masculinity}
- Uncertainty Avoidance: ${scores.culture.uncertaintyAvoidance}
- Long-term Orientation: ${scores.culture.longTermOrientation}
- Indulgence: ${scores.culture.indulgence}

Work Values (0-100):
- Innovation: ${scores.values.innovation}
- Collaboration: ${scores.values.collaboration}
- Autonomy: ${scores.values.autonomy}
- Quality: ${scores.values.quality}
- Customer Focus: ${scores.values.customerFocus}

Please provide your response in the following JSON format:

{
  "ocean": {
    "insights": ["3-4 key insights about their personality"],
    "recommendations": ["3-4 specific recommendations"],
    "nextSteps": ["3-4 actionable next steps"]
  },
  "culture": {
    "insights": ["3-4 key insights about their work style preferences"],
    "recommendations": ["3-4 specific recommendations"],
    "nextSteps": ["3-4 actionable next steps"]
  },
  "values": {
    "insights": ["3-4 key insights about their work values"],
    "recommendations": ["3-4 specific recommendations"],
    "nextSteps": ["3-4 actionable next steps"]
  },
  "overall": {
    "summary": "A comprehensive summary paragraph",
    "keyStrengths": ["3-4 key strengths"],
    "developmentAreas": ["3-4 areas for development"],
    "careerSuggestions": ["3-4 career path suggestions"]
  }
}

Make the recommendations specific, actionable, and tailored to their scores. Focus on practical advice they can implement immediately.
    `;
  }

  private static parseAIResponse(response: string): AIRecommendations {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndFormatRecommendations(parsed);
      }
      
      // If no JSON found, return fallback
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private static validateAndFormatRecommendations(data: any): AIRecommendations {
    // Validate and provide fallbacks for missing data
    return {
      ocean: {
        context: data.ocean?.context || 'Based on your OCEAN personality profile, you have unique traits that influence how you work and interact with others.',
        recommendations: Array.isArray(data.ocean?.recommendations) ? data.ocean.recommendations : [
          {
            title: "Leverage Your Personality Strengths",
            description: "Your personality traits show specific strengths that can guide your career choices and work style preferences.",
            nextSteps: [
              "Reflect on how your personality traits show up in your daily work",
              "Identify work environments that align with your natural tendencies",
              "Practice using your strengths in team situations"
            ]
          }
        ],
      },
      culture: {
        context: data.culture?.context || 'Your cultural preferences indicate specific work environments where you\'ll thrive and feel most productive.',
        recommendations: Array.isArray(data.culture?.recommendations) ? data.culture.recommendations : [
          {
            title: "Find Your Cultural Fit",
            description: "Look for organizations and teams that match your cultural preferences and work style.",
            nextSteps: [
              "Research company cultures before applying to jobs",
              "Ask about organizational structure in interviews",
              "Seek out teams that align with your work preferences"
            ]
          }
        ],
      },
      values: {
        context: data.values?.context || 'Your work values represent what truly motivates and drives you professionally.',
        recommendations: Array.isArray(data.values?.recommendations) ? data.values.recommendations : [
          {
            title: "Align Work with Your Values",
            description: "Focus on roles and organizations that align with your highest work values.",
            nextSteps: [
              "Identify specific job opportunities that match your values",
              "Evaluate potential employers based on your values",
              "Communicate your values in job interviews"
            ]
          }
        ],
      },
    };
  }

  static getFallbackRecommendations(scores: AssessmentScores): AIRecommendations {
    // Provide basic fallback recommendations based on scores
    const getScoreLevel = (score: number) => {
      if (score >= 70) return 'high';
      if (score >= 40) return 'moderate';
      return 'low';
    };

    return {
      ocean: {
        context: `Based on your OCEAN personality profile, you show ${getScoreLevel(scores.ocean.openness)} openness, ${getScoreLevel(scores.ocean.conscientiousness)} conscientiousness, ${getScoreLevel(scores.ocean.extraversion)} extraversion, ${getScoreLevel(scores.ocean.agreeableness)} agreeableness, and ${getScoreLevel(scores.ocean.neuroticism)} neuroticism.`,
        recommendations: [
          {
            title: "Leverage Your Personality Strengths",
            description: "Your personality traits show specific strengths that can guide your career choices and work style preferences.",
            nextSteps: [
              "Reflect on how your personality traits show up in your daily work",
              "Identify work environments that align with your natural tendencies",
              "Practice using your strengths in team situations"
            ]
          },
          {
            title: "Develop Complementary Skills",
            description: "Consider developing skills that complement your natural personality traits for better balance.",
            nextSteps: [
              "Seek feedback on areas where you can grow",
              "Practice skills that don't come naturally to you",
              "Find mentors who can help you develop new approaches"
            ]
          }
        ]
      },
      culture: {
        context: `Your cultural preferences show ${getScoreLevel(scores.culture.powerDistance)} power distance, ${getScoreLevel(scores.culture.individualism)} individualism, and ${getScoreLevel(scores.culture.uncertaintyAvoidance)} uncertainty avoidance preferences.`,
        recommendations: [
          {
            title: "Find Your Cultural Fit",
            description: "Look for organizations and teams that match your cultural preferences and work style.",
            nextSteps: [
              "Research company cultures before applying to jobs",
              "Ask about organizational structure in interviews",
              "Seek out teams that align with your work preferences"
            ]
          },
          {
            title: "Adapt to Different Cultures",
            description: "Learn to work effectively in different cultural environments while staying true to your values.",
            nextSteps: [
              "Practice flexibility in different work environments",
              "Learn about different organizational cultures",
              "Develop cross-cultural communication skills"
            ]
          }
        ]
      },
      values: {
        context: `Your work values show ${getScoreLevel(scores.values.innovation)} innovation, ${getScoreLevel(scores.values.collaboration)} collaboration, and ${getScoreLevel(scores.values.quality)} quality focus preferences.`,
        recommendations: [
          {
            title: "Align Work with Your Values",
            description: "Focus on roles and organizations that align with your highest work values.",
            nextSteps: [
              "Identify specific job opportunities that match your values",
              "Evaluate potential employers based on your values",
              "Communicate your values in job interviews"
            ]
          },
          {
            title: "Balance Multiple Values",
            description: "Learn to balance different work values and find roles that satisfy multiple priorities.",
            nextSteps: [
              "Prioritize your values for different career stages",
              "Look for roles that can satisfy multiple values",
              "Be willing to compromise on lower-priority values"
            ]
          }
        ]
      }
    };
  }

  // Generate team-level insights
  static async generateTeamInsights(teamScores: AssessmentScores, memberCount: number): Promise<any> {
    try {
      const prompt = `
Based on the following team aggregate assessment results for a team of ${memberCount} members, provide team-level insights and recommendations:

Team OCEAN Scores (0-100):
- Openness: ${teamScores.ocean.openness}
- Conscientiousness: ${teamScores.ocean.conscientiousness}
- Extraversion: ${teamScores.ocean.extraversion}
- Agreeableness: ${teamScores.ocean.agreeableness}
- Neuroticism: ${teamScores.ocean.neuroticism}

Team Cultural Preferences (0-100):
- Power Distance: ${teamScores.culture.powerDistance}
- Individualism: ${teamScores.culture.individualism}
- Masculinity: ${teamScores.culture.masculinity}
- Uncertainty Avoidance: ${teamScores.culture.uncertaintyAvoidance}
- Long-term Orientation: ${teamScores.culture.longTermOrientation}
- Indulgence: ${teamScores.culture.indulgence}

Team Values (0-100):
- Innovation: ${teamScores.values.innovation}
- Collaboration: ${teamScores.values.collaboration}
- Autonomy: ${teamScores.values.autonomy}
- Quality: ${teamScores.values.quality}
- Customer Focus: ${teamScores.values.customerFocus}

Provide insights about team dynamics, potential conflicts, strengths, and recommendations for effective collaboration.
      `;

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in team dynamics and organizational psychology. Provide insights about team composition, potential challenges, and recommendations for effective collaboration."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0]?.message?.content || 'Team insights could not be generated at this time.';
    } catch (error) {
      console.error('Error generating team insights:', error);
      return 'Team insights are being processed. Please check back later.';
    }
  }
}
