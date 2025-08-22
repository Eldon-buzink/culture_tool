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
    insights: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  culture: {
    insights: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  values: {
    insights: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  overall: {
    summary: string;
    keyStrengths: string[];
    developmentAreas: string[];
    careerSuggestions: string[];
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
        insights: Array.isArray(data.ocean?.insights) ? data.ocean.insights : [],
        recommendations: Array.isArray(data.ocean?.recommendations) ? data.ocean.recommendations : [],
        nextSteps: Array.isArray(data.ocean?.nextSteps) ? data.ocean.nextSteps : [],
      },
      culture: {
        insights: Array.isArray(data.culture?.insights) ? data.culture.insights : [],
        recommendations: Array.isArray(data.culture?.recommendations) ? data.culture.recommendations : [],
        nextSteps: Array.isArray(data.culture?.nextSteps) ? data.culture.nextSteps : [],
      },
      values: {
        insights: Array.isArray(data.values?.insights) ? data.values.insights : [],
        recommendations: Array.isArray(data.values?.recommendations) ? data.values.recommendations : [],
        nextSteps: Array.isArray(data.values?.nextSteps) ? data.values.nextSteps : [],
      },
      overall: {
        summary: data.overall?.summary || 'Based on your assessment results, you have a unique combination of personality traits, work preferences, and values.',
        keyStrengths: Array.isArray(data.overall?.keyStrengths) ? data.overall.keyStrengths : [],
        developmentAreas: Array.isArray(data.overall?.developmentAreas) ? data.overall.developmentAreas : [],
        careerSuggestions: Array.isArray(data.overall?.careerSuggestions) ? data.overall.careerSuggestions : [],
      },
    };
  }

  private static getFallbackRecommendations(scores: AssessmentScores): AIRecommendations {
    // Provide basic fallback recommendations based on scores
    const getScoreLevel = (score: number) => {
      if (score >= 70) return 'high';
      if (score >= 40) return 'moderate';
      return 'low';
    };

    return {
      ocean: {
        insights: [
          `Your openness score of ${scores.ocean.openness} indicates a ${getScoreLevel(scores.ocean.openness)} level of curiosity and willingness to try new things.`,
          `With a conscientiousness score of ${scores.ocean.conscientiousness}, you show a ${getScoreLevel(scores.ocean.conscientiousness)} level of organization and reliability.`,
          `Your extraversion score of ${scores.ocean.extraversion} suggests you prefer ${getScoreLevel(scores.ocean.extraversion)} levels of social interaction.`
        ],
        recommendations: [
          'Consider how your personality traits influence your work preferences and communication style.',
          'Look for work environments that align with your natural tendencies.',
          'Develop strategies to work effectively with people who have different personality profiles.'
        ],
        nextSteps: [
          'Reflect on how these traits show up in your daily work.',
          'Identify specific situations where your personality strengths are most valuable.',
          'Consider taking additional assessments to deepen your self-awareness.'
        ],
      },
      culture: {
        insights: [
          `Your power distance preference of ${scores.culture.powerDistance} indicates how you prefer ${getScoreLevel(scores.culture.powerDistance)} levels of hierarchy in the workplace.`,
          `With an individualism score of ${scores.culture.individualism}, you prefer ${getScoreLevel(scores.culture.individualism)} levels of independent work.`,
          `Your uncertainty avoidance score of ${scores.culture.uncertaintyAvoidance} shows you prefer ${getScoreLevel(scores.culture.uncertaintyAvoidance)} levels of structure and predictability.`
        ],
        recommendations: [
          'Seek out work environments that match your cultural preferences.',
          'Communicate your work style preferences to your team and manager.',
          'Develop strategies to work effectively in diverse cultural environments.'
        ],
        nextSteps: [
          'Research companies and teams that align with your cultural preferences.',
          'Practice adapting your communication style to different work cultures.',
          'Consider how your preferences might evolve over time.'
        ],
      },
      values: {
        insights: [
          `Your innovation score of ${scores.values.innovation} indicates a ${getScoreLevel(scores.values.innovation)} preference for creative problem-solving.`,
          `With a collaboration score of ${scores.values.collaboration}, you prefer ${getScoreLevel(scores.values.collaboration)} levels of teamwork.`,
          `Your quality focus score of ${scores.values.quality} shows you prioritize ${getScoreLevel(scores.values.quality)} levels of excellence in your work.`
        ],
        recommendations: [
          'Look for roles that align with your highest-value areas.',
          'Communicate your values to potential employers and team members.',
          'Seek out projects that allow you to work in your areas of strength.'
        ],
        nextSteps: [
          'Identify specific job opportunities that match your values.',
          'Develop skills that support your highest-value areas.',
          'Create a personal mission statement based on your values.'
        ],
      },
      overall: {
        summary: 'Your assessment results reveal a unique combination of personality traits, work preferences, and values that can guide your career decisions and help you find fulfilling work environments.',
        keyStrengths: [
          'Self-awareness and willingness to understand your preferences',
          'Unique combination of traits that can be valuable in the right context',
          'Potential for growth and development in multiple areas'
        ],
        developmentAreas: [
          'Understanding how to leverage your strengths effectively',
          'Developing strategies to work with different personality types',
          'Finding environments that align with your preferences'
        ],
        careerSuggestions: [
          'Consider roles that align with your highest scores',
          'Look for companies with cultures that match your preferences',
          'Explore opportunities that allow you to develop your lower-scoring areas'
        ],
      },
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
