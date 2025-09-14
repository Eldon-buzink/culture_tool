export type Trait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
export type Band = 'lower' | 'balanced' | 'higher';

export const scoreToBand = (score: number): Band => {
  if (score <= 35) return 'lower';
  if (score >= 65) return 'higher';
  return 'balanced';
};

export const traitMeta = {
  openness: {
    label: 'Openness',
    bands: {
      lower: {
        styleLabel: 'Structure-first',
        tagline: 'Prefers proven approaches over constant novelty.',
        strengths: ['Stability during change', 'Clear, practical decisions', 'Consistent quality delivery'],
        watchouts: ['May postpone trying new tools without rationale', 'Could miss emerging opportunities'],
        needs: ['Clear "why" for change', 'Step-by-step rollouts', 'Time to process new information'],
        bestContexts: ['Risk-sensitive work', 'Quality & consistency roles', 'Process optimization'],
        growth: ['Pilot one small new idea per quarter', 'Pair with a "scout" teammate to sample options', 'Set aside 30 minutes weekly to explore one new concept']
      },
      balanced: {
        styleLabel: 'Pragmatic explorer',
        tagline: 'Mixes new ideas with practical guardrails.',
        strengths: ['Flexible yet grounded', 'Balanced risk-taking', 'Adaptable to change'],
        watchouts: ['Can get spread thin', 'May overthink decisions'],
        needs: ['Timeboxes for exploration', 'Clear success criteria', 'Regular check-ins'],
        bestContexts: ['Discovery with delivery accountability', 'Cross-functional projects', 'Innovation with constraints'],
        growth: ['Write a one-pager before adopting new tools', 'Set monthly "experiment time"', 'Share learnings with team weekly']
      },
      higher: {
        styleLabel: 'Frontier-seeker',
        tagline: 'Energized by new ideas and experiments.',
        strengths: ['Idea generation', 'Rapid pattern spotting', 'Creative problem-solving'],
        watchouts: ['May pivot too fast', 'Could lose focus on execution'],
        needs: ['Criteria to exit/continue experiments', 'Structured follow-through', 'Clear boundaries'],
        bestContexts: ['Innovation sprints', 'Early discovery phases', 'Creative projects'],
        growth: ['Run A/B experiments with pre-agreed stop rules', 'Block 2 hours weekly for deep creative work', 'Document and share one insight weekly']
      }
    }
  },
  conscientiousness: {
    label: 'Conscientiousness',
    bands: {
      lower: {
        styleLabel: 'Adaptive doer',
        tagline: 'Thrives in flexible, dynamic environments.',
        strengths: ['Quick adaptation', 'Comfortable with ambiguity', 'Spontaneous problem-solving'],
        watchouts: ['May struggle with rigid deadlines', 'Could benefit from more structure'],
        needs: ['Flexible timelines', 'Clear priorities', 'Support with planning'],
        bestContexts: ['Startup environments', 'Creative projects', 'Rapid iteration work'],
        growth: ['Use a simple daily priority list', 'Set weekly check-ins with a planning partner', 'Try the "2-minute rule" for small tasks']
      },
      balanced: {
        styleLabel: 'Balanced organizer',
        tagline: 'Mixes structure with flexibility as needed.',
        strengths: ['Adaptable planning', 'Consistent delivery', 'Good work-life balance'],
        watchouts: ['May over-plan sometimes', 'Could under-plan in other areas'],
        needs: ['Regular planning reviews', 'Flexible frameworks', 'Clear communication'],
        bestContexts: ['Project management', 'Team coordination', 'Client-facing roles'],
        growth: ['Weekly planning sessions', 'Use time-blocking for important tasks', 'Set monthly goal reviews']
      },
      higher: {
        styleLabel: 'Reliable planner',
        tagline: 'Excels with clear structure and detailed planning.',
        strengths: ['Exceptional organization', 'Consistent follow-through', 'Quality attention to detail'],
        watchouts: ['May over-plan', 'Could resist last-minute changes'],
        needs: ['Clear expectations', 'Adequate planning time', 'Recognition for thoroughness'],
        bestContexts: ['Process-heavy roles', 'Quality assurance', 'Long-term projects'],
        growth: ['Mentor others in planning skills', 'Set aside time for creative thinking', 'Practice saying yes to one spontaneous request weekly']
      }
    }
  },
  extraversion: {
    label: 'Extraversion',
    bands: {
      lower: {
        styleLabel: 'Calm contributor',
        tagline: 'Thrives in focused, thoughtful environments.',
        strengths: ['Deep focus', 'Thoughtful analysis', 'Independent work'],
        watchouts: ['May need more time to process', 'Could be overlooked in group settings'],
        needs: ['Quiet work time', 'Advance notice for meetings', 'Written communication options'],
        bestContexts: ['Research roles', 'Deep technical work', 'Individual contributor positions'],
        growth: ['Practice speaking up in one meeting weekly', 'Share one insight via email before meetings', 'Try the "one question" rule in group discussions']
      },
      balanced: {
        styleLabel: 'Situational connector',
        tagline: 'Adapts energy to the situation and people.',
        strengths: ['Versatile communication', 'Good listener and speaker', 'Balanced social energy'],
        watchouts: ['May overextend socially', 'Could struggle with energy management'],
        needs: ['Energy awareness', 'Recovery time', 'Clear social boundaries'],
        bestContexts: ['Client relations', 'Team leadership', 'Cross-functional work'],
        growth: ['Track your energy levels daily', 'Set social time boundaries', 'Practice active listening in one conversation daily']
      },
      higher: {
        styleLabel: 'Energized connector',
        tagline: 'Brings energy and enthusiasm to group dynamics.',
        strengths: ['Natural networking', 'Team motivation', 'Quick relationship building'],
        watchouts: ['May dominate conversations', 'Could struggle with quiet work'],
        needs: ['Speaking time limits', 'Quiet work periods', 'Active listening practice'],
        bestContexts: ['Sales and marketing', 'Team leadership', 'Public-facing roles'],
        growth: ['Practice the "2-minute rule" in conversations', 'Set daily quiet work time', 'Ask one thoughtful question before sharing your view']
      }
    }
  },
  agreeableness: {
    label: 'Agreeableness',
    bands: {
      lower: {
        styleLabel: 'Direct challenger',
        tagline: 'Comfortable with healthy conflict and direct feedback.',
        strengths: ['Honest communication', 'Objective decision-making', 'Constructive criticism'],
        watchouts: ['May come across as harsh', 'Could benefit from softer delivery'],
        needs: ['Clear communication guidelines', 'Feedback on delivery', 'Recognition for honesty'],
        bestContexts: ['Quality assurance', 'Strategic planning', 'Performance management'],
        growth: ['Practice the "sandwich method" for feedback', 'Ask "How can I help?" before pointing out problems', 'Set a weekly goal to acknowledge one person\'s contribution']
      },
      balanced: {
        styleLabel: 'Balanced collaborator',
        tagline: 'Mixes cooperation with healthy assertiveness.',
        strengths: ['Good team player', 'Constructive communication', 'Balanced perspective'],
        watchouts: ['May avoid difficult conversations', 'Could struggle with tough decisions'],
        needs: ['Conflict resolution skills', 'Decision-making frameworks', 'Support for difficult conversations'],
        bestContexts: ['Team coordination', 'Project management', 'Client relations'],
        growth: ['Practice one difficult conversation weekly', 'Use "I" statements when giving feedback', 'Set boundaries around your time and energy']
      },
      higher: {
        styleLabel: 'Support-first collaborator',
        tagline: 'Naturally supportive and team-oriented.',
        strengths: ['Team harmony', 'Supportive leadership', 'Conflict resolution'],
        watchouts: ['May avoid difficult conversations', 'Could struggle with saying no'],
        needs: ['Boundary-setting skills', 'Support for difficult decisions', 'Recognition for contributions'],
        bestContexts: ['Team leadership', 'Customer success', 'Mentoring roles'],
        growth: ['Practice saying no to one request weekly', 'Set aside time for your own priorities', 'Use "I need to think about this" before agreeing to new commitments']
      }
    }
  },
  neuroticism: {
    label: 'Neuroticism',
    bands: {
      lower: {
        styleLabel: 'Steady under pressure',
        tagline: 'Maintains calm and focus in challenging situations.',
        strengths: ['Emotional stability', 'Clear thinking under pressure', 'Reliable performance'],
        watchouts: ['May not recognize others\' stress', 'Could benefit from more emotional awareness'],
        needs: ['Recognition for stability', 'Support for others\' emotions', 'Stress management tools'],
        bestContexts: ['High-pressure roles', 'Crisis management', 'Leadership positions'],
        growth: ['Practice emotional check-ins with team members', 'Set weekly "how are you doing" conversations', 'Try mindfulness for 5 minutes daily']
      },
      balanced: {
        styleLabel: 'Realistic responder',
        tagline: 'Balances optimism with realistic assessment of challenges.',
        strengths: ['Balanced perspective', 'Good stress management', 'Realistic planning'],
        watchouts: ['May overthink sometimes', 'Could benefit from more optimism'],
        needs: ['Regular check-ins', 'Stress management tools', 'Support systems'],
        bestContexts: ['Project management', 'Team coordination', 'Client-facing roles'],
        growth: ['Practice gratitude journaling', 'Set weekly stress check-ins', 'Try one optimistic reframe daily']
      },
      higher: {
        styleLabel: 'Sensitivity-aware',
        tagline: 'Highly attuned to emotions and potential challenges.',
        strengths: ['High emotional intelligence', 'Empathetic leadership', 'Early problem detection'],
        watchouts: ['May overthink decisions', 'Could benefit from stress management'],
        needs: ['Stress management tools', 'Support systems', 'Clear communication'],
        bestContexts: ['People management', 'Creative roles', 'Customer success'],
        growth: ['Practice daily stress management techniques', 'Set boundaries around work hours', 'Try the "5-4-3-2-1" grounding technique when overwhelmed']
      }
    }
  }
} satisfies Record<Trait, any>;

export const getTraitStyleLabel = (trait: Trait, score: number): string => {
  const band = scoreToBand(score);
  return traitMeta[trait].bands[band].styleLabel;
};

export const getTraitTagline = (trait: Trait, score: number): string => {
  const band = scoreToBand(score);
  return traitMeta[trait].bands[band].tagline;
};
