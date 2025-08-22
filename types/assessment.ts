export interface AssessmentResults {
  oceanScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  cultureScores: {
    powerDistance: number;
    individualism: number;
    masculinity: number;
    uncertaintyAvoidance: number;
    longTermOrientation: number;
    indulgence: number;
    [key: string]: number;
  };
  valuesScores: {
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
    [key: string]: number;
  };
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
  recommendations: {
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
  };
  teamComparison?: {
    oceanScores: Record<string, number>;
    cultureScores: Record<string, number>;
    valuesScores: Record<string, number>;
  };
}

export interface SaveResultsData {
  assessmentId: string;
  oceanScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  cultureScores: {
    powerDistance: number;
    individualism: number;
    masculinity: number;
    uncertaintyAvoidance: number;
    longTermOrientation: number;
    indulgence: number;
  };
  valuesScores: {
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
  };
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
  recommendations: {
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
  };
}
