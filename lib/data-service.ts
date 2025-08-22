import { prisma } from './database';
import { AssessmentResults } from '@/types/assessment';

export interface CreateUserData {
  email: string;
  name: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  createdBy: string;
}

export interface CreateAssessmentData {
  title: string;
  description?: string;
  type: 'individual' | 'team';
  createdBy: string;
  teamId?: string;
}

export interface SaveResponseData {
  assessmentId: string;
  userId: string;
  section: string;
  questionId: string;
  response: number;
}

export interface SaveResultsData {
  assessmentId: string;
  oceanScores: Record<string, number>;
  cultureScores: Record<string, number>;
  valuesScores: Record<string, number>;
  insights: Record<string, string[]>;
  recommendations: Record<string, any[]>;
}

// User operations
export async function createUser(data: CreateUserData) {
  return await prisma.user.create({
    data
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      assessments: true,
      teamMemberships: {
        include: {
          team: true
        }
      }
    }
  });
}

// Team operations
export async function createTeam(data: CreateTeamData) {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      code: generateTeamCode(),
      members: {
        create: {
          userId: data.createdBy,
          role: 'owner'
        }
      }
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });
  
  return team;
}

export async function getTeamByCode(code: string) {
  return await prisma.team.findUnique({
    where: { code },
    include: {
      members: {
        include: {
          user: true
        }
      },
      assessments: {
        include: {
          results: true
        }
      }
    }
  });
}

export async function addTeamMember(teamId: string, userId: string, role: string = 'member') {
  return await prisma.teamMember.create({
    data: {
      teamId,
      userId,
      role
    },
    include: {
      user: true,
      team: true
    }
  });
}

// Assessment operations
export async function createAssessment(data: CreateAssessmentData) {
  return await prisma.assessment.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      createdBy: data.createdBy,
      teamId: data.teamId,
      status: 'draft'
    },
    include: {
      team: true
    }
  });
}

export async function getAssessmentById(id: string) {
  return await prisma.assessment.findUnique({
    where: { id },
    include: {
      team: true,
      responses: {
        include: {
          user: true
        }
      },
      results: true
    }
  });
}

export async function getAssessmentByUuid(uuid: string) {
  return await prisma.assessment.findUnique({
    where: { id: uuid },
    include: {
      team: true,
      responses: {
        include: {
          user: true
        }
      },
      results: true
    }
  });
}

export async function updateAssessmentStatus(id: string, status: string) {
  return await prisma.assessment.update({
    where: { id },
    data: { status }
  });
}

// Response operations
export async function saveResponse(data: SaveResponseData) {
  // First try to find existing response
  const existingResponse = await prisma.assessmentResponse.findFirst({
    where: {
      assessmentId: data.assessmentId,
      userId: data.userId,
      section: data.section,
      questionId: data.questionId
    }
  });

  if (existingResponse) {
    // Update existing response
    return await prisma.assessmentResponse.update({
      where: { id: existingResponse.id },
      data: { response: data.response }
    });
  } else {
    // Create new response
    return await prisma.assessmentResponse.create({
      data: {
        assessmentId: data.assessmentId,
        userId: data.userId,
        section: data.section,
        questionId: data.questionId,
        response: data.response
      }
    });
  }
}

export async function getAssessmentResponses(assessmentId: string, userId: string) {
  return await prisma.assessmentResponse.findMany({
    where: {
      assessmentId,
      userId
    }
  });
}

// Results operations
export async function saveAssessmentResults(data: SaveResultsData) {
  return await prisma.assessmentResult.create({
    data: {
      assessmentId: data.assessmentId,
      oceanOpenness: data.oceanScores.openness,
      oceanConscientiousness: data.oceanScores.conscientiousness,
      oceanExtraversion: data.oceanScores.extraversion,
      oceanAgreeableness: data.oceanScores.agreeableness,
      oceanNeuroticism: data.oceanScores.neuroticism,
      culturePowerDistance: data.cultureScores.powerDistance,
      cultureIndividualism: data.cultureScores.individualism,
      cultureMasculinity: data.cultureScores.masculinity,
      cultureUncertaintyAvoidance: data.cultureScores.uncertaintyAvoidance,
      cultureLongTermOrientation: data.cultureScores.longTermOrientation,
      cultureIndulgence: data.cultureScores.indulgence,
      valuesInnovation: data.valuesScores.innovation,
      valuesCollaboration: data.valuesScores.collaboration,
      valuesAutonomy: data.valuesScores.autonomy,
      valuesQuality: data.valuesScores.quality,
      valuesCustomerFocus: data.valuesScores.customerFocus,
      insights: JSON.stringify(data.insights),
      recommendations: JSON.stringify(data.recommendations)
    }
  });
}

export async function getAssessmentResults(assessmentId: string): Promise<AssessmentResults | null> {
  const result = await prisma.assessmentResult.findUnique({
    where: { assessmentId }
  });

  if (!result) return null;

  return {
    oceanScores: {
      openness: result.oceanOpenness,
      conscientiousness: result.oceanConscientiousness,
      extraversion: result.oceanExtraversion,
      agreeableness: result.oceanAgreeableness,
      neuroticism: result.oceanNeuroticism
    },
    cultureScores: {
      powerDistance: result.culturePowerDistance,
      individualism: result.cultureIndividualism,
      masculinity: result.cultureMasculinity,
      uncertaintyAvoidance: result.cultureUncertaintyAvoidance,
      longTermOrientation: result.cultureLongTermOrientation,
      indulgence: result.cultureIndulgence
    },
    valuesScores: {
      innovation: result.valuesInnovation,
      collaboration: result.valuesCollaboration,
      autonomy: result.valuesAutonomy,
      quality: result.valuesQuality,
      customerFocus: result.valuesCustomerFocus
    },
    insights: JSON.parse(result.insights),
    recommendations: JSON.parse(result.recommendations)
  };
}

// Team invitation operations
export async function createTeamInvitation(teamId: string, email: string, name?: string, message?: string) {
  return await prisma.teamInvitation.create({
    data: {
      teamId,
      email,
      name,
      message
    }
  });
}

export async function getTeamInvitations(teamId: string) {
  return await prisma.teamInvitation.findMany({
    where: { teamId },
    orderBy: { sentAt: 'desc' }
  });
}

// Utility functions
function generateTeamCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Migration helper - create sample data
export async function createSampleData() {
  // Get or create a sample user
  let user = await getUserByEmail('test@example.com');
  if (!user) {
    user = await createUser({
      email: 'test@example.com',
      name: 'Test User'
    });
  }

  // Check if team already exists
  const existingTeam = await prisma.team.findFirst({
    where: { name: 'Sample Team' }
  });

  let team;
  if (!existingTeam) {
    // Create a sample team
    team = await createTeam({
      name: 'Sample Team',
      description: 'A sample team for testing',
      createdBy: user.id
    });
  } else {
    team = existingTeam;
  }

  // Check if assessment already exists
  const existingAssessment = await prisma.assessment.findFirst({
    where: { title: 'Sample Assessment' }
  });

  let assessment;
  if (!existingAssessment) {
    // Create a sample assessment
    assessment = await createAssessment({
      title: 'Sample Assessment',
      description: 'A sample assessment for testing',
      type: 'individual',
      createdBy: user.id
    });
  } else {
    assessment = existingAssessment;
  }

  console.log('Sample data created:', { user, team, assessment });
  return { user, team, assessment };
}
