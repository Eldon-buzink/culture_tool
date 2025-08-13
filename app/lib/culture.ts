// Culture Mapping and Analysis

import { OCEANScores } from './traits';

export interface CultureProfile {
  type: string;
  description: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export interface TeamCultureInsights {
  dominantTraits: string[];
  cultureType: string;
  communicationStyle: string;
  workStyle: string;
  leadershipStyle: string;
  collaborationPattern: string;
}

export function mapCultureTraits(scores: OCEANScores): TeamCultureInsights {
  const insights: TeamCultureInsights = {
    dominantTraits: [],
    cultureType: '',
    communicationStyle: '',
    workStyle: '',
    leadershipStyle: '',
    collaborationPattern: '',
  };

  // Determine dominant traits
  const traitScores = [
    { trait: 'openness', score: scores.openness },
    { trait: 'conscientiousness', score: scores.conscientiousness },
    { trait: 'extraversion', score: scores.extraversion },
    { trait: 'agreeableness', score: scores.agreeableness },
    { trait: 'neuroticism', score: scores.neuroticism },
  ];

  traitScores.sort((a, b) => b.score - a.score);
  insights.dominantTraits = traitScores.slice(0, 2).map(t => t.trait);

  // Determine culture type
  insights.cultureType = determineCultureType(scores);

  // Determine communication style
  insights.communicationStyle = determineCommunicationStyle(scores);

  // Determine work style
  insights.workStyle = determineWorkStyle(scores);

  // Determine leadership style
  insights.leadershipStyle = determineLeadershipStyle(scores);

  // Determine collaboration pattern
  insights.collaborationPattern = determineCollaborationPattern(scores);

  return insights;
}

function determineCultureType(scores: OCEANScores): string {
  if (scores.openness > 70 && scores.extraversion > 60) {
    return 'Innovative & Collaborative';
  } else if (scores.conscientiousness > 70 && scores.agreeableness > 60) {
    return 'Structured & Harmonious';
  } else if (scores.extraversion > 70 && scores.agreeableness > 60) {
    return 'Social & Supportive';
  } else if (scores.openness > 70 && scores.conscientiousness < 50) {
    return 'Creative & Flexible';
  } else if (scores.conscientiousness > 70 && scores.neuroticism < 40) {
    return 'Reliable & Stable';
  } else if (scores.agreeableness > 70 && scores.neuroticism < 40) {
    return 'Cooperative & Calm';
  } else {
    return 'Balanced & Adaptive';
  }
}

function determineCommunicationStyle(scores: OCEANScores): string {
  if (scores.extraversion > 70) {
    return 'Direct and expressive communication, prefers face-to-face interactions';
  } else if (scores.extraversion < 40) {
    return 'Thoughtful and written communication, prefers asynchronous methods';
  } else if (scores.agreeableness > 70) {
    return 'Collaborative and diplomatic communication style';
  } else if (scores.conscientiousness > 70) {
    return 'Structured and detailed communication with clear agendas';
  } else {
    return 'Balanced communication approach, adaptable to different contexts';
  }
}

function determineWorkStyle(scores: OCEANScores): string {
  if (scores.conscientiousness > 70 && scores.openness < 50) {
    return 'Process-oriented with strong attention to detail and deadlines';
  } else if (scores.openness > 70 && scores.conscientiousness < 50) {
    return 'Creative and flexible approach, adapts to changing requirements';
  } else if (scores.extraversion > 70) {
    return 'Collaborative and team-focused work approach';
  } else if (scores.extraversion < 40) {
    return 'Independent and focused work style with deep concentration';
  } else {
    return 'Balanced approach combining structure with flexibility';
  }
}

function determineLeadershipStyle(scores: OCEANScores): string {
  if (scores.extraversion > 70 && scores.agreeableness > 60) {
    return 'Democratic and inclusive leadership, encourages participation';
  } else if (scores.conscientiousness > 70 && scores.neuroticism < 40) {
    return 'Structured and reliable leadership with clear expectations';
  } else if (scores.openness > 70 && scores.extraversion > 60) {
    return 'Innovative and inspiring leadership, encourages creativity';
  } else if (scores.agreeableness > 70 && scores.neuroticism < 40) {
    return 'Supportive and nurturing leadership style';
  } else {
    return 'Adaptive leadership style based on situation and team needs';
  }
}

function determineCollaborationPattern(scores: OCEANScores): string {
  if (scores.agreeableness > 70 && scores.extraversion > 60) {
    return 'Highly collaborative with strong team dynamics and mutual support';
  } else if (scores.conscientiousness > 70 && scores.agreeableness > 60) {
    return 'Structured collaboration with clear roles and responsibilities';
  } else if (scores.openness > 70 && scores.extraversion > 60) {
    return 'Creative collaboration with brainstorming and innovation focus';
  } else if (scores.extraversion < 40 && scores.agreeableness > 60) {
    return 'Supportive collaboration with individual work and periodic check-ins';
  } else {
    return 'Flexible collaboration approach adapting to project needs';
  }
}

export function generateCultureRecommendations(insights: TeamCultureInsights): string[] {
  const recommendations: string[] = [];

  // Communication recommendations
  if (insights.communicationStyle.includes('Direct and expressive')) {
    recommendations.push('Consider implementing structured meeting formats to ensure all voices are heard');
  } else if (insights.communicationStyle.includes('Thoughtful and written')) {
    recommendations.push('Schedule regular face-to-face check-ins to build stronger relationships');
  }

  // Work style recommendations
  if (insights.workStyle.includes('Process-oriented')) {
    recommendations.push('Introduce innovation sessions to encourage creative problem-solving');
  } else if (insights.workStyle.includes('Creative and flexible')) {
    recommendations.push('Establish clear project milestones to maintain accountability');
  }

  // Collaboration recommendations
  if (insights.collaborationPattern.includes('Highly collaborative')) {
    recommendations.push('Create opportunities for focused individual work to balance team dynamics');
  } else if (insights.collaborationPattern.includes('Individual work')) {
    recommendations.push('Increase team-building activities to strengthen collaboration');
  }

  // Culture type specific recommendations
  if (insights.cultureType.includes('Innovative')) {
    recommendations.push('Leverage creative strengths while establishing clear implementation processes');
  } else if (insights.cultureType.includes('Structured')) {
    recommendations.push('Maintain organizational strengths while encouraging innovation');
  } else if (insights.cultureType.includes('Social')) {
    recommendations.push('Channel social energy into productive collaboration and knowledge sharing');
  }

  return recommendations;
}

export function analyzeTeamDynamics(scores: OCEANScores): {
  strengths: string[];
  challenges: string[];
  opportunities: string[];
} {
  const analysis = {
    strengths: [] as string[],
    challenges: [] as string[],
    opportunities: [] as string[],
  };

  // Analyze strengths
  if (scores.agreeableness > 60) {
    analysis.strengths.push('Strong team collaboration and cooperation');
  }
  if (scores.conscientiousness > 60) {
    analysis.strengths.push('Reliable and organized work approach');
  }
  if (scores.openness > 60) {
    analysis.strengths.push('Creative and innovative thinking');
  }
  if (scores.extraversion > 60) {
    analysis.strengths.push('Strong communication and social engagement');
  }
  if (scores.neuroticism < 40) {
    analysis.strengths.push('Emotional stability and resilience');
  }

  // Analyze challenges
  if (scores.agreeableness < 40) {
    analysis.challenges.push('Potential conflicts in team dynamics');
  }
  if (scores.conscientiousness < 40) {
    analysis.challenges.push('May struggle with organization and deadlines');
  }
  if (scores.openness < 40) {
    analysis.challenges.push('Resistance to change and new ideas');
  }
  if (scores.extraversion < 40) {
    analysis.challenges.push('Limited social interaction and communication');
  }
  if (scores.neuroticism > 60) {
    analysis.challenges.push('Stress sensitivity and emotional volatility');
  }

  // Analyze opportunities
  if (scores.openness > 70 && scores.conscientiousness < 50) {
    analysis.opportunities.push('Balance creativity with structure for optimal innovation');
  }
  if (scores.extraversion > 70 && scores.agreeableness < 50) {
    analysis.opportunities.push('Channel energy into constructive collaboration');
  }
  if (scores.conscientiousness > 70 && scores.openness < 50) {
    analysis.opportunities.push('Introduce creative processes to enhance innovation');
  }

  return analysis;
}
