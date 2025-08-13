// OCEAN Personality Traits Scoring Logic

export interface OCEANScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface Question {
  id: string;
  text: string;
  category: keyof OCEANScores;
  reverseScored?: boolean;
}

export function calculateOCEANScores(
  answers: Record<string, number>,
  questions: Question[]
): OCEANScores {
  const scores: OCEANScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  const categoryCounts: Record<keyof OCEANScores, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  questions.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      let score = answer;
      
      // Handle reverse-scored questions (1-5 scale becomes 5-1)
      if (question.reverseScored) {
        score = 6 - answer; // Convert 1->5, 2->4, 3->3, 4->2, 5->1
      }

      scores[question.category] += score;
      categoryCounts[question.category]++;
    }
  });

  // Calculate averages and convert to percentage (0-100)
  Object.keys(scores).forEach(category => {
    const key = category as keyof OCEANScores;
    if (categoryCounts[key] > 0) {
      scores[key] = Math.round((scores[key] / categoryCounts[key]) * 20); // Convert 1-5 scale to 0-100
    }
  });

  return scores;
}

export function interpretOCEANScores(scores: OCEANScores): Record<keyof OCEANScores, string> {
  const interpretations: Record<keyof OCEANScores, string> = {
    openness: '',
    conscientiousness: '',
    extraversion: '',
    agreeableness: '',
    neuroticism: '',
  };

  // Openness interpretations
  if (scores.openness >= 80) {
    interpretations.openness = 'Very High - Highly creative, curious, and open to new experiences';
  } else if (scores.openness >= 60) {
    interpretations.openness = 'High - Creative and open to new ideas';
  } else if (scores.openness >= 40) {
    interpretations.openness = 'Moderate - Balanced approach to new experiences';
  } else if (scores.openness >= 20) {
    interpretations.openness = 'Low - Prefers routine and familiar situations';
  } else {
    interpretations.openness = 'Very Low - Strongly prefers structure and tradition';
  }

  // Conscientiousness interpretations
  if (scores.conscientiousness >= 80) {
    interpretations.conscientiousness = 'Very High - Highly organized, reliable, and goal-oriented';
  } else if (scores.conscientiousness >= 60) {
    interpretations.conscientiousness = 'High - Organized and dependable';
  } else if (scores.conscientiousness >= 40) {
    interpretations.conscientiousness = 'Moderate - Balanced approach to planning and organization';
  } else if (scores.conscientiousness >= 20) {
    interpretations.conscientiousness = 'Low - More spontaneous and flexible';
  } else {
    interpretations.conscientiousness = 'Very Low - Highly spontaneous and unstructured';
  }

  // Extraversion interpretations
  if (scores.extraversion >= 80) {
    interpretations.extraversion = 'Very High - Highly social, energetic, and outgoing';
  } else if (scores.extraversion >= 60) {
    interpretations.extraversion = 'High - Social and energetic';
  } else if (scores.extraversion >= 40) {
    interpretations.extraversion = 'Moderate - Balanced social energy';
  } else if (scores.extraversion >= 20) {
    interpretations.extraversion = 'Low - More reserved and introspective';
  } else {
    interpretations.extraversion = 'Very Low - Highly introverted and reserved';
  }

  // Agreeableness interpretations
  if (scores.agreeableness >= 80) {
    interpretations.agreeableness = 'Very High - Highly cooperative, trusting, and compassionate';
  } else if (scores.agreeableness >= 60) {
    interpretations.agreeableness = 'High - Cooperative and trusting';
  } else if (scores.agreeableness >= 40) {
    interpretations.agreeableness = 'Moderate - Balanced approach to cooperation';
  } else if (scores.agreeableness >= 20) {
    interpretations.agreeableness = 'Low - More competitive and challenging';
  } else {
    interpretations.agreeableness = 'Very Low - Highly competitive and challenging';
  }

  // Neuroticism interpretations (lower is better)
  if (scores.neuroticism <= 20) {
    interpretations.neuroticism = 'Very Low - Highly emotionally stable and resilient';
  } else if (scores.neuroticism <= 40) {
    interpretations.neuroticism = 'Low - Emotionally stable';
  } else if (scores.neuroticism <= 60) {
    interpretations.neuroticism = 'Moderate - Balanced emotional responses';
  } else if (scores.neuroticism <= 80) {
    interpretations.neuroticism = 'High - More sensitive to stress and emotions';
  } else {
    interpretations.neuroticism = 'Very High - Highly sensitive to stress and emotional changes';
  }

  return interpretations;
}

export function generatePersonalityInsights(scores: OCEANScores): string[] {
  const insights: string[] = [];

  // Openness insights
  if (scores.openness > 70) {
    insights.push('Your high openness suggests you thrive in creative and innovative environments');
  } else if (scores.openness < 40) {
    insights.push('Your preference for structure suggests you work well with clear processes and guidelines');
  }

  // Conscientiousness insights
  if (scores.conscientiousness > 70) {
    insights.push('Your high conscientiousness indicates strong organizational skills and reliability');
  } else if (scores.conscientiousness < 40) {
    insights.push('Your flexibility suggests adaptability to changing circumstances');
  }

  // Extraversion insights
  if (scores.extraversion > 70) {
    insights.push('Your high extraversion suggests you energize through social interactions');
  } else if (scores.extraversion < 40) {
    insights.push('Your introversion suggests you prefer focused, independent work');
  }

  // Agreeableness insights
  if (scores.agreeableness > 70) {
    insights.push('Your high agreeableness indicates strong team collaboration potential');
  } else if (scores.agreeableness < 40) {
    insights.push('Your directness suggests effectiveness in challenging situations');
  }

  // Neuroticism insights
  if (scores.neuroticism < 30) {
    insights.push('Your emotional stability suggests resilience under pressure');
  } else if (scores.neuroticism > 70) {
    insights.push('Consider stress management strategies for optimal performance');
  }

  return insights;
}
