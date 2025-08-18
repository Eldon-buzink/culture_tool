import { prisma } from '../prisma';
import { AssessmentStatus, TeamMemberStatus } from '@prisma/client';

export interface CreateAssessmentData {
  userId: string;
  teamId?: string;
}

export interface SubmitResponseData {
  assessmentId: string;
  questionId: string;
  response: number;
}

export interface AssessmentWithResults {
  id: string;
  status: AssessmentStatus;
  startedAt: Date;
  completedAt?: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  team?: {
    id: string;
    name: string;
    code: string;
  };
  results?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    powerDistance: number;
    individualism: number;
    masculinity: number;
    uncertaintyAvoidance: number;
    longTermOrientation: number;
    indulgence: number;
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
  };
}

export class AssessmentService {
  // Create a new assessment
  static async createAssessment(data: CreateAssessmentData) {
    return await prisma.assessment.create({
      data: {
        userId: data.userId,
        teamId: data.teamId,
        status: AssessmentStatus.IN_PROGRESS,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  // Submit a response to a question
  static async submitResponse(data: SubmitResponseData) {
    return await prisma.assessmentResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId: data.assessmentId,
          questionId: data.questionId,
        },
      },
      update: {
        response: data.response,
      },
      create: {
        assessmentId: data.assessmentId,
        questionId: data.questionId,
        response: data.response,
      },
    });
  }

  // Get assessment with all responses
  static async getAssessment(assessmentId: string) {
    return await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        responses: true,
        results: true,
      },
    });
  }

  // Complete an assessment and calculate results
  static async completeAssessment(assessmentId: string) {
    // Get all responses for the assessment
    const assessment = await this.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Calculate scores
    const scores = this.calculateScores(assessment.responses);

    // Create results and update assessment status
    const [results] = await prisma.$transaction([
      prisma.assessmentResult.create({
        data: {
          assessmentId,
          ...scores,
        },
      }),
      prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: AssessmentStatus.COMPLETED,
          completedAt: new Date(),
        },
      }),
    ]);

    // If this is a team assessment, update team member status
    if (assessment.teamId) {
      await prisma.teamMember.updateMany({
        where: {
          teamId: assessment.teamId,
          userId: assessment.userId,
        },
        data: {
          status: TeamMemberStatus.COMPLETED,
        },
      });
    }

    return results;
  }

  // Calculate scores from responses
  static calculateScores(responses: Array<{ questionId: string; response: number }>) {
    const responseMap = new Map(responses.map(r => [r.questionId, r.response]));

    // OCEAN calculation
    const oceanScores = this.calculateOCEANScores(responseMap);
    
    // Culture calculation
    const cultureScores = this.calculateCultureScores(responseMap);
    
    // Values calculation
    const valuesScores = this.calculateValuesScores(responseMap);

    return {
      // OCEAN Scores
      openness: oceanScores.openness,
      conscientiousness: oceanScores.conscientiousness,
      extraversion: oceanScores.extraversion,
      agreeableness: oceanScores.agreeableness,
      neuroticism: oceanScores.neuroticism,
      
      // Culture Scores
      powerDistance: cultureScores.powerDistance,
      individualism: cultureScores.individualism,
      masculinity: cultureScores.masculinity,
      uncertaintyAvoidance: cultureScores.uncertaintyAvoidance,
      longTermOrientation: cultureScores.longTermOrientation,
      indulgence: cultureScores.indulgence,
      
      // Values Scores
      innovation: valuesScores.innovation,
      collaboration: valuesScores.collaboration,
      autonomy: valuesScores.autonomy,
      quality: valuesScores.quality,
      customerFocus: valuesScores.customerFocus,
    };
  }

  static calculateOCEANScores(responseMap: Map<string, number>) {
    const oceanQuestions = {
      openness: ['ocean_5', 'ocean_10', 'ocean_15', 'ocean_20'],
      conscientiousness: ['ocean_1', 'ocean_6', 'ocean_11', 'ocean_16'],
      extraversion: ['ocean_2', 'ocean_7', 'ocean_12', 'ocean_17'],
      agreeableness: ['ocean_3', 'ocean_8', 'ocean_13', 'ocean_18'],
      neuroticism: ['ocean_4', 'ocean_9', 'ocean_14', 'ocean_19'],
    };

    const reverseScored = {
      'ocean_6': true, 'ocean_7': true, 'ocean_8': true, 'ocean_9': true, 'ocean_10': true,
      'ocean_15': true, 'ocean_16': true, 'ocean_17': true, 'ocean_18': true, 'ocean_19': true, 'ocean_20': true,
    };

    const scores: Record<string, number> = {};

    Object.entries(oceanQuestions).forEach(([trait, questionIds]) => {
      const traitResponses = questionIds
        .map(id => responseMap.get(id))
        .filter(response => response !== undefined);

      if (traitResponses.length === 0) {
        scores[trait] = 0;
        return;
      }

      const adjustedResponses = traitResponses.map((response, index) => {
        const questionId = questionIds[index];
        return reverseScored[questionId as keyof typeof reverseScored] ? (8 - response!) : response!;
      });

      const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
      scores[trait] = Math.round((average / 7) * 100);
    });

    return scores;
  }

  static calculateCultureScores(responseMap: Map<string, number>) {
    const cultureQuestions = {
      powerDistance: ['culture_1', 'culture_2'],
      individualism: ['culture_3', 'culture_4'],
      masculinity: ['culture_5', 'culture_6'],
      uncertaintyAvoidance: ['culture_7', 'culture_8'],
      longTermOrientation: ['culture_9', 'culture_10'],
      indulgence: ['culture_11', 'culture_12'],
    };

    const reverseScored = {
      'culture_2': true, 'culture_4': true, 'culture_6': true, 'culture_8': true, 'culture_10': true, 'culture_12': true,
    };

    const scores: Record<string, number> = {};

    Object.entries(cultureQuestions).forEach(([trait, questionIds]) => {
      const traitResponses = questionIds
        .map(id => responseMap.get(id))
        .filter(response => response !== undefined);

      if (traitResponses.length === 0) {
        scores[trait] = 0;
        return;
      }

      const adjustedResponses = traitResponses.map((response, index) => {
        const questionId = questionIds[index];
        return reverseScored[questionId as keyof typeof reverseScored] ? (8 - response!) : response!;
      });

      const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
      scores[trait] = Math.round((average / 7) * 100);
    });

    return scores;
  }

  static calculateValuesScores(responseMap: Map<string, number>) {
    const valuesQuestions = {
      innovation: ['values_1', 'values_2'],
      collaboration: ['values_3', 'values_4'],
      autonomy: ['values_5', 'values_6'],
      quality: ['values_7', 'values_8'],
      customerFocus: ['values_9', 'values_10'],
    };

    const reverseScored = {
      'values_2': true, 'values_4': true, 'values_6': true, 'values_8': true, 'values_10': true,
    };

    const scores: Record<string, number> = {};

    Object.entries(valuesQuestions).forEach(([trait, questionIds]) => {
      const traitResponses = questionIds
        .map(id => responseMap.get(id))
        .filter(response => response !== undefined);

      if (traitResponses.length === 0) {
        scores[trait] = 0;
        return;
      }

      const adjustedResponses = traitResponses.map((response, index) => {
        const questionId = questionIds[index];
        return reverseScored[questionId as keyof typeof reverseScored] ? (8 - response!) : response!;
      });

      const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
      scores[trait] = Math.round((average / 7) * 100);
    });

    return scores;
  }

  // Get team aggregate scores
  static async getTeamAggregateScores(teamId: string) {
    const teamAssessments = await prisma.assessment.findMany({
      where: {
        teamId,
        status: AssessmentStatus.COMPLETED,
      },
      include: {
        results: true,
      },
    });

    if (teamAssessments.length === 0) {
      return null;
    }

    const results = teamAssessments.map(a => a.results).filter(Boolean);
    
    // Calculate averages
    const aggregateScores = {
      ocean: {
        openness: Math.round(results.reduce((sum, r) => sum + r!.openness, 0) / results.length),
        conscientiousness: Math.round(results.reduce((sum, r) => sum + r!.conscientiousness, 0) / results.length),
        extraversion: Math.round(results.reduce((sum, r) => sum + r!.extraversion, 0) / results.length),
        agreeableness: Math.round(results.reduce((sum, r) => sum + r!.agreeableness, 0) / results.length),
        neuroticism: Math.round(results.reduce((sum, r) => sum + r!.neuroticism, 0) / results.length),
      },
      culture: {
        powerDistance: Math.round(results.reduce((sum, r) => sum + r!.powerDistance, 0) / results.length),
        individualism: Math.round(results.reduce((sum, r) => sum + r!.individualism, 0) / results.length),
        masculinity: Math.round(results.reduce((sum, r) => sum + r!.masculinity, 0) / results.length),
        uncertaintyAvoidance: Math.round(results.reduce((sum, r) => sum + r!.uncertaintyAvoidance, 0) / results.length),
        longTermOrientation: Math.round(results.reduce((sum, r) => sum + r!.longTermOrientation, 0) / results.length),
        indulgence: Math.round(results.reduce((sum, r) => sum + r!.indulgence, 0) / results.length),
      },
      values: {
        innovation: Math.round(results.reduce((sum, r) => sum + r!.innovation, 0) / results.length),
        collaboration: Math.round(results.reduce((sum, r) => sum + r!.collaboration, 0) / results.length),
        autonomy: Math.round(results.reduce((sum, r) => sum + r!.autonomy, 0) / results.length),
        quality: Math.round(results.reduce((sum, r) => sum + r!.quality, 0) / results.length),
        customerFocus: Math.round(results.reduce((sum, r) => sum + r!.customerFocus, 0) / results.length),
      },
    };

    return aggregateScores;
  }
}
