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
      // Pre-processing: Apply rules engine to set prompt toggles
      const promptConfig = this.applyPreProcessingRules(scores);
      
      const prompt = this.buildPrompt(scores, promptConfig);
      
      let attempts = 0;
      const maxAttempts = 3;
      let recommendations: AIRecommendations;

      while (attempts < maxAttempts) {
        attempts++;
        
        const completion = await getOpenAI().chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a personal development coach who helps people understand themselves and create meaningful habits. You focus on behaviors, rituals, and personal growth rather than job titles or corporate jargon. You write in a warm, encouraging, and immediately actionable way. You avoid generic career advice and instead provide specific, personal recommendations that people can start today.`
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

        recommendations = this.parseAIResponse(response);
        
        // Post-processing: Validate quality and apply improvement rules
        const validationResult = this.applyPostProcessingRules(recommendations, scores);
        
        if (validationResult.isValid) {
          // Two-pass generation: Use critic to improve recommendations
          const improvedRecommendations = await this.applyCriticPass(recommendations, scores);
          return improvedRecommendations;
        } else {
          console.warn(`Recommendation quality check failed (attempt ${attempts}):`, validationResult.issues);
          
          if (attempts < maxAttempts) {
            // Add feedback to prompt for next attempt
            prompt += `\n\nIMPORTANT: Previous attempt had these issues: ${validationResult.issues.join(', ')}. Please address these specific problems.`;
          }
        }
      }

      // If all attempts failed, return the last attempt with fallback improvements
      return this.applyFallbackImprovements(recommendations!, scores);
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getFallbackRecommendations(scores);
    }
  }

  private static buildPrompt(scores: AssessmentScores, promptConfig?: any): string {
    // Create user intent block
    const userIntent = {
      career_titles: false,
      personal_life: true,
      behavioral_focus: true
    };

    // Identify high traits for special handling
    const highOpenness = scores.ocean.openness >= 70;
    const highIndividualism = scores.culture.individualism >= 65;
    const lowPowerDistance = scores.culture.powerDistance <= 45;
    const highAgreeableness = scores.ocean.agreeableness >= 70;
    const lowNeuroticism = scores.ocean.neuroticism <= 40;

    return `
You write practical, non-jargony guidance. Focus on behaviors, rituals, and environments. Avoid job titles, departments, and methodologies unless user_intent.career_titles=true. Include at least one personal-life suggestion when creativity/openness is high. Output valid JSON matching the provided schema only—no prose outside JSON.

ASSESSMENT DATA:
OCEAN: Openness ${scores.ocean.openness}, Conscientiousness ${scores.ocean.conscientiousness}, Extraversion ${scores.ocean.extraversion}, Agreeableness ${scores.ocean.agreeableness}, Neuroticism ${scores.ocean.neuroticism}
CULTURE: Power Distance ${scores.culture.powerDistance}, Individualism ${scores.culture.individualism}, Uncertainty Avoidance ${scores.culture.uncertaintyAvoidance}
VALUES: Innovation ${scores.values.innovation}, Collaboration ${scores.values.collaboration}, Quality ${scores.values.quality}

USER INTENT: ${JSON.stringify(promptConfig?.userIntent || userIntent)}

REQUIREMENTS:
${promptConfig?.requirements?.join('\n') || ''}

BANNED PHRASES: "innovation team", "product squad", "agile", "MVP", "hackathon", "join a team", "find a role", "career path", "department", "methodology"

EXAMPLES OF GOOD VS BAD:
Bad: "Join an innovation team to channel your creativity."
Good: "Block a 60-minute weekly 'curiosity window' to explore a topic you picked—sketch it, write a one-pager, or record a 2-minute voice note. Share one takeaway with a colleague."

Bad: "Find a collaborative environment."
Good: "Start a weekly 'idea exchange' with 2-3 colleagues where you each share one thing you learned and one challenge you're facing."

Bad: "Develop leadership skills."
Good: "Practice saying 'I need to think about this' before making decisions, and schedule 15 minutes daily to reflect on what went well."

JSON SCHEMA:
{
  "ocean": {
    "context": "Brief personality summary (1-2 sentences)",
    "recommendations": [
      {
        "title": "Action-oriented title starting with verb",
        "description": "Specific behavioral instruction with timing/frequency",
        "nextSteps": ["Immediate action items (max 3)"]
      }
    ]
  },
  "culture": {
    "context": "Brief work style summary (1-2 sentences)",
    "recommendations": [
      {
        "title": "Action-oriented title starting with verb",
        "description": "Specific behavioral instruction with timing/frequency", 
        "nextSteps": ["Immediate action items (max 3)"]
      }
    ]
  },
  "values": {
    "context": "Brief values summary (1-2 sentences)",
    "recommendations": [
      {
        "title": "Action-oriented title starting with verb",
        "description": "Specific behavioral instruction with timing/frequency",
        "nextSteps": ["Immediate action items (max 3)"]
      }
    ]
  }
}

Each recommendation must:
- Start with an action verb
- Include specific timing/frequency
- Be immediately actionable
- Focus on behaviors, not job titles
- Be personal and relatable
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

  private static validateRecommendationQuality(recommendations: any): boolean {
    const bannedPhrases = [
      'innovation team', 'product squad', 'agile', 'mvp', 'hackathon',
      'join a team', 'find a role', 'career path', 'department', 'methodology',
      'become a', 'work in', 'pursue a career', 'get into'
    ];

    const text = JSON.stringify(recommendations).toLowerCase();
    
    // Check for banned phrases
    for (const phrase of bannedPhrases) {
      if (text.includes(phrase)) {
        console.warn(`Found banned phrase in recommendations: ${phrase}`);
        return false;
      }
    }

    // Check for action verbs in titles
    const actionVerbs = ['schedule', 'block', 'practice', 'start', 'create', 'build', 'develop', 'explore', 'dedicate', 'set', 'establish'];
    let hasActionVerbs = false;
    
    if (recommendations.ocean?.recommendations) {
      for (const rec of recommendations.ocean.recommendations) {
        if (rec.title && actionVerbs.some(verb => rec.title.toLowerCase().startsWith(verb))) {
          hasActionVerbs = true;
          break;
        }
      }
    }

    return hasActionVerbs;
  }

  // Pre-processing rules engine
  private static applyPreProcessingRules(scores: AssessmentScores): any {
    const rules = {
      highOpenness: scores.ocean.openness >= 70,
      highConscientiousness: scores.ocean.conscientiousness >= 70,
      highExtraversion: scores.ocean.extraversion >= 70,
      highAgreeableness: scores.ocean.agreeableness >= 70,
      lowNeuroticism: scores.ocean.neuroticism <= 40,
      highIndividualism: scores.culture.individualism >= 65,
      lowPowerDistance: scores.culture.powerDistance <= 45,
      highUncertaintyAvoidance: scores.culture.uncertaintyAvoidance >= 70,
      highInnovation: scores.values.innovation >= 70,
      highCollaboration: scores.values.collaboration >= 70,
      highQuality: scores.values.quality >= 70
    };

    // Generate specific requirements based on rules
    const requirements = [];
    
    if (rules.highOpenness) {
      requirements.push("- Include at least one personal creative activity (e.g., weekly exploration time, creative journaling)");
    }
    
    if (rules.highIndividualism) {
      requirements.push("- Include one personal autonomy habit and one team alignment habit");
    }
    
    if (rules.lowPowerDistance) {
      requirements.push("- Include one peer-to-peer collaboration ritual");
    }
    
    if (rules.highAgreeableness) {
      requirements.push("- Include boundary-setting practices");
    }
    
    if (rules.lowNeuroticism) {
      requirements.push("- Include stretch goals with recovery rituals");
    }
    
    if (rules.highConscientiousness) {
      requirements.push("- Include time management and organization habits");
    }
    
    if (rules.highExtraversion) {
      requirements.push("- Include social energy management practices");
    }
    
    if (rules.highUncertaintyAvoidance) {
      requirements.push("- Include structured planning and preparation habits");
    }
    
    if (rules.highInnovation) {
      requirements.push("- Include creative problem-solving practices");
    }
    
    if (rules.highCollaboration) {
      requirements.push("- Include team communication and feedback habits");
    }
    
    if (rules.highQuality) {
      requirements.push("- Include attention to detail and excellence practices");
    }

    return {
      rules,
      requirements,
      userIntent: {
        career_titles: false,
        personal_life: true,
        behavioral_focus: true,
        trait_specific: true
      }
    };
  }

  // Post-processing rules engine
  private static applyPostProcessingRules(recommendations: AIRecommendations, scores: AssessmentScores): {isValid: boolean, issues: string[], recommendations: AIRecommendations} {
    const issues: string[] = [];
    
    // Check for banned phrases
    const bannedPhrases = [
      'innovation team', 'product squad', 'agile', 'mvp', 'hackathon',
      'join a team', 'find a role', 'career path', 'department', 'methodology',
      'become a', 'work in', 'pursue a career', 'get into', 'apply for',
      'look for', 'seek out', 'consider a', 'explore a career'
    ];

    const text = JSON.stringify(recommendations).toLowerCase();
    for (const phrase of bannedPhrases) {
      if (text.includes(phrase)) {
        issues.push(`Contains banned phrase: "${phrase}"`);
      }
    }

    // Check for action verbs in titles
    const actionVerbs = ['schedule', 'block', 'practice', 'start', 'create', 'build', 'develop', 'explore', 'dedicate', 'set', 'establish', 'begin', 'implement', 'try', 'experiment'];
    let hasActionVerbs = false;
    
    const allRecommendations = [
      ...(recommendations.ocean?.recommendations || []),
      ...(recommendations.culture?.recommendations || []),
      ...(recommendations.values?.recommendations || [])
    ];

    for (const rec of allRecommendations) {
      if (rec.title && actionVerbs.some(verb => rec.title.toLowerCase().startsWith(verb))) {
        hasActionVerbs = true;
        break;
      }
    }

    if (!hasActionVerbs) {
      issues.push("Recommendation titles don't start with action verbs");
    }

    // Check for specific timing/frequency
    const timingWords = ['daily', 'weekly', 'monthly', 'every', 'schedule', 'block', 'set aside', 'minutes', 'hours', 'times'];
    let hasTiming = false;
    
    for (const rec of allRecommendations) {
      if (rec.description && timingWords.some(word => rec.description.toLowerCase().includes(word))) {
        hasTiming = true;
        break;
      }
    }

    if (!hasTiming) {
      issues.push("Recommendations lack specific timing/frequency");
    }

    // Check for personal life suggestions when openness is high
    if (scores.ocean.openness >= 70) {
      const personalWords = ['personal', 'outside work', 'hobby', 'creative', 'explore', 'curiosity', 'journal', 'sketch', 'write'];
      let hasPersonalSuggestion = false;
      
      for (const rec of allRecommendations) {
        if (rec.description && personalWords.some(word => rec.description.toLowerCase().includes(word))) {
          hasPersonalSuggestion = true;
          break;
        }
      }

      if (!hasPersonalSuggestion) {
        issues.push("High openness requires personal life suggestions");
      }
    }

    // Check for boundary-setting when agreeableness is high
    if (scores.ocean.agreeableness >= 70) {
      const boundaryWords = ['boundary', 'say no', 'decline', 'limit', 'protect', 'preserve', 'maintain'];
      let hasBoundarySuggestion = false;
      
      for (const rec of allRecommendations) {
        if (rec.description && boundaryWords.some(word => rec.description.toLowerCase().includes(word))) {
          hasBoundarySuggestion = true;
          break;
        }
      }

      if (!hasBoundarySuggestion) {
        issues.push("High agreeableness requires boundary-setting suggestions");
      }
    }

    // Check for peer-to-peer suggestions when power distance is low
    if (scores.culture.powerDistance <= 45) {
      const peerWords = ['peer', 'colleague', 'team member', 'together', 'collaborate', 'share', 'exchange'];
      let hasPeerSuggestion = false;
      
      for (const rec of allRecommendations) {
        if (rec.description && peerWords.some(word => rec.description.toLowerCase().includes(word))) {
          hasPeerSuggestion = true;
          break;
        }
      }

      if (!hasPeerSuggestion) {
        issues.push("Low power distance requires peer-to-peer suggestions");
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Fallback improvements when validation fails
  private static applyFallbackImprovements(recommendations: AIRecommendations, scores: AssessmentScores): AIRecommendations {
    // Apply basic improvements to make recommendations more actionable
    const improved = JSON.parse(JSON.stringify(recommendations)); // Deep clone
    
    // Add timing to recommendations that lack it
    const allRecommendations = [
      ...(improved.ocean?.recommendations || []),
      ...(improved.culture?.recommendations || []),
      ...(improved.values?.recommendations || [])
    ];

    for (const rec of allRecommendations) {
      if (rec.description && !rec.description.toLowerCase().includes('weekly') && !rec.description.toLowerCase().includes('daily')) {
        rec.description = `Schedule 30 minutes weekly to ${rec.description.toLowerCase()}`;
      }
      
      if (rec.title && !rec.title.toLowerCase().startsWith('schedule') && !rec.title.toLowerCase().startsWith('block')) {
        rec.title = `Schedule ${rec.title.toLowerCase()}`;
      }
    }

    return improved;
  }

  // Two-pass generation: Critic pass to improve recommendations
  private static async applyCriticPass(recommendations: AIRecommendations, scores: AssessmentScores): Promise<AIRecommendations> {
    try {
      const criticPrompt = `
You are a quality critic for personal development recommendations. Review the following recommendations and improve them to be more actionable, personal, and behavior-focused.

CURRENT RECOMMENDATIONS:
${JSON.stringify(recommendations, null, 2)}

ASSESSMENT CONTEXT:
OCEAN: Openness ${scores.ocean.openness}, Conscientiousness ${scores.ocean.conscientiousness}, Extraversion ${scores.ocean.extraversion}, Agreeableness ${scores.ocean.agreeableness}, Neuroticism ${scores.ocean.neuroticism}

CRITIC CHECKLIST:
1. Remove any job-title advice or corporate jargon
2. Replace org-structure solutions with behavioral prescriptions
3. Ensure at least one suggestion is outside work if creativity/openness is high (≥70)
4. Trim to ≤ 7 items total; make each item start with a verb
5. Add specific timing/frequency where missing
6. Make language more personal and relatable
7. Focus on immediate actions people can take today

IMPROVEMENT RULES:
- If title doesn't start with action verb, rewrite it
- If description lacks timing, add "Schedule X minutes weekly/daily to..."
- If too generic, make it more specific and personal
- If too corporate, make it more human and relatable
- If missing personal life suggestions for high openness, add one

Return the improved recommendations in the same JSON format. Make each recommendation more actionable and personal.
      `;

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a quality critic who improves personal development recommendations to be more actionable, personal, and behavior-focused. You focus on making recommendations immediately actionable and relatable."
          },
          {
            role: "user",
            content: criticPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent improvements
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return recommendations; // Return original if critic fails
      }

      // Parse the improved recommendations
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const improved = JSON.parse(jsonMatch[0]);
        return this.validateAndFormatRecommendations(improved);
      }

      return recommendations; // Return original if parsing fails
    } catch (error) {
      console.error('Error in critic pass:', error);
      return recommendations; // Return original if critic fails
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
Based on the following team aggregate assessment results for a team of ${memberCount} members, provide concise, readable team insights:

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

IMPORTANT: Write 3-4 short, clear insights (max 100 characters each). Use simple language. Focus on:
- Team strengths and what they excel at
- Potential challenges to watch for
- How the team works best together
- Key dynamics to leverage

Avoid complex sentences and jargon. Make it scannable and actionable. Focus on behaviors and team dynamics, not job titles or corporate structures.
      `;

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in team dynamics. Write concise, readable insights that are easy to scan and understand. Use simple language and short sentences. Focus on practical, actionable observations about team dynamics and behaviors. Avoid corporate jargon and focus on how people actually work together."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || 'Team insights could not be generated at this time.';
    } catch (error) {
      console.error('Error generating team insights:', error);
      return 'Team insights are being processed. Please check back later.';
    }
  }
}
