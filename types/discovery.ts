/**
 * Type definitions for Personal Discovery Flow
 * Based on MODEL_CONTENT_ENERGY_ATTACHMENT.md
 */

// ============================================================================
// Model Types
// ============================================================================

export type ModelSlug = 
  | 'energy'
  | 'attachment'
  | 'love-languages'
  | 'conflict-style'
  | 'what-moves-you'
  | 'decision-compass';

export type ModelCategory = 
  | 'personal'
  | 'relationship'
  | 'work'
  | 'growth';

// ============================================================================
// Selection Options
// ============================================================================

export interface ModelOption {
  slug: ModelSlug;
  curiosity: string; // "What energizes me?"
  outcome: string; // "Feel more energized"
  category: ModelCategory;
  timeEstimate: string; // "~5 min"
  description?: string;
}

// ============================================================================
// Assessment Types
// ============================================================================

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string | number;
}

export interface AssessmentAnswer {
  questionId: string;
  optionId: string;
  value: string | number;
}

export interface AssessmentProgress {
  modelSlug: ModelSlug;
  answers: AssessmentAnswer[];
  currentQuestionIndex: number;
  insightsShown: string[]; // IDs of insights already revealed
}

// ============================================================================
// Progressive Insights
// ============================================================================

export interface ProgressiveInsight {
  id: string;
  triggerAfterQuestion: number; // Show after this many questions
  condition?: (answers: AssessmentAnswer[]) => boolean; // Optional condition function
  text: string;
  type: 'hint' | 'pattern' | 'revelation';
}

// ============================================================================
// Results Types
// ============================================================================

export interface ModelInsights {
  headline: string;
  noticed: string[];
  meaning: string[];
  action: string;
}

// Energy Model
export interface EnergyResults {
  boosters: {
    activities: string[];
    contexts: string[];
    people: string[];
    pace: string;
  };
  drainers: {
    activities: string[];
    contexts: string[];
    people: string[];
    pace: string;
  };
  patterns: {
    timeOfDay?: string;
    socialVsSolo?: string;
    taskType?: string;
  };
  insights: ModelInsights;
}

// Attachment Styles Model
export interface AttachmentResults {
  style: 'secure' | 'anxious' | 'avoidant' | 'fearful';
  needs: string[];
  patterns: string[];
  strengths: string[];
  challenges: string[];
  insights: ModelInsights;
}

// Love Languages Model
export interface LoveLanguagesResults {
  primary: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  secondary: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  howTheyExpress: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  gap?: {
    express: string;
    receive: string;
  };
  insights: ModelInsights;
}

// Conflict Style Model
export interface ConflictStyleResults {
  style: 'collaborator' | 'competitor' | 'accommodator' | 'avoider' | 'compromiser';
  strengths: string[];
  challenges: string[];
  whenItWorks: string[];
  whenToAdapt: string[];
  insights: ModelInsights;
}

// What Moves You Model
export interface WhatMovesYouResults {
  primary: 'creator' | 'connector' | 'learner' | 'grower' | 'achiever';
  secondary?: 'creator' | 'connector' | 'learner' | 'grower' | 'achiever';
  whatEnergizes: string[];
  whatDrainsMeaning: string[];
  values: string[];
  insights: ModelInsights;
}

// Decision Compass Model
export interface DecisionCompassResults {
  style: 'analytical' | 'intuitive' | 'balanced' | 'cautious' | 'quick';
  primaryInfluence: 'logic' | 'feeling' | 'values' | 'others' | 'risk';
  speed: 'fast' | 'moderate' | 'slow';
  riskTolerance: 'high' | 'moderate' | 'low';
  strengths: string[];
  whenToAdapt: string[];
  insights: ModelInsights;
}

// Union type for all results
export type DiscoveryResults = 
  | EnergyResults
  | AttachmentResults
  | LoveLanguagesResults
  | ConflictStyleResults
  | WhatMovesYouResults
  | DecisionCompassResults;

// ============================================================================
// Session Types
// ============================================================================

export interface DiscoverySession {
  id: string;
  userId?: string; // Optional - can be anonymous
  completedModels: ModelSlug[];
  currentAssessment?: AssessmentProgress;
  results: Record<ModelSlug, DiscoveryResults>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Explore More Types
// ============================================================================

export interface ExploreMoreOption {
  type: 'dive-deeper' | 'other-model';
  title: string;
  description: string;
  modelSlug?: ModelSlug; // Required if type is 'other-model'
  action: string; // What they'll do
}
