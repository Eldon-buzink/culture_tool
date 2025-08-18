import { prisma } from '../prisma';
import { TeamMemberStatus } from '@prisma/client';
import { AssessmentService } from './assessmentService';

export interface CreateTeamData {
  name: string;
  description?: string;
  creatorId: string;
  memberEmails: string[];
}

export interface TeamWithMembers {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    status: TeamMemberStatus;
    joinedAt?: Date | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export class TeamService {
  // Generate a unique team code
  private static generateTeamCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new team
  static async createTeam(data: CreateTeamData) {
    let teamCode: string;
    let isUnique = false;

    // Generate unique team code
    while (!isUnique) {
      teamCode = this.generateTeamCode();
      const existingTeam = await prisma.team.findUnique({
        where: { code: teamCode },
      });
      if (!existingTeam) {
        isUnique = true;
      }
    }

    // Create team and members in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          name: data.name,
          description: data.description,
          code: teamCode!,
          creatorId: data.creatorId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Add creator as first member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: data.creatorId,
          status: TeamMemberStatus.COMPLETED,
          joinedAt: new Date(),
        },
      });

      // Add other members
      for (const email of data.memberEmails) {
        // Find or create user
        let user = await tx.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              email,
              name: email.split('@')[0], // Use email prefix as name
            },
          });
        }

        // Add member (skip if already added)
        await tx.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId: newTeam.id,
              userId: user.id,
            },
          },
          update: {},
          create: {
            teamId: newTeam.id,
            userId: user.id,
            status: TeamMemberStatus.INVITED,
          },
        });
      }

      return newTeam;
    });

    return team;
  }

  // Get team by code
  static async getTeamByCode(code: string) {
    return await prisma.team.findUnique({
      where: { code },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Get team with detailed member information
  static async getTeamWithMembers(teamId: string): Promise<TeamWithMembers | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return team;
  }

  // Join a team
  static async joinTeam(teamCode: string, userId: string) {
    const team = await this.getTeamByCode(teamCode);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId,
        },
      },
    });

    if (existingMember) {
      // Update status to in progress
      return await prisma.teamMember.update({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId,
          },
        },
        data: {
          status: TeamMemberStatus.IN_PROGRESS,
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    // Add new member
    return await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        status: TeamMemberStatus.IN_PROGRESS,
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Get team dashboard data
  static async getTeamDashboardData(teamId: string) {
    const team = await this.getTeamWithMembers(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Get aggregate scores
    const aggregateScores = await AssessmentService.getTeamAggregateScores(teamId);

    // Get team insights
    const insights = await this.generateTeamInsights(teamId, aggregateScores);

    return {
      team,
      aggregateScores,
      insights,
    };
  }

  // Generate team insights
  private static async generateTeamInsights(teamId: string, aggregateScores: any) {
    if (!aggregateScores) {
      return {
        strengths: ['Team assessment in progress'],
        challenges: ['Complete individual assessments to see team insights'],
        opportunities: ['Invite team members to participate'],
      };
    }

    const insights = {
      strengths: [] as string[],
      challenges: [] as string[],
      opportunities: [] as string[],
    };

    // Analyze OCEAN scores
    if (aggregateScores.ocean.conscientiousness > 70) {
      insights.strengths.push('High conscientiousness suggests strong attention to detail and reliability');
    }
    if (aggregateScores.ocean.openness > 70) {
      insights.strengths.push('High openness indicates creativity and adaptability');
    }
    if (aggregateScores.ocean.extraversion < 40) {
      insights.challenges.push('Low extraversion may require structured communication approaches');
    }

    // Analyze Culture scores
    if (aggregateScores.culture.uncertaintyAvoidance < 40) {
      insights.strengths.push('Low uncertainty avoidance suggests comfort with change and innovation');
    }
    if (aggregateScores.culture.powerDistance > 70) {
      insights.challenges.push('High power distance may require clear hierarchical communication');
    }

    // Analyze Values scores
    if (aggregateScores.values.innovation > 70) {
      insights.strengths.push('High innovation values support creative problem-solving');
    }
    if (aggregateScores.values.quality > 70) {
      insights.strengths.push('Strong quality focus ensures excellent deliverables');
    }

    // Generate opportunities
    if (aggregateScores.ocean.openness > 60 && aggregateScores.values.innovation > 60) {
      insights.opportunities.push('Leverage creative thinking for innovation projects');
    }
    if (aggregateScores.ocean.conscientiousness > 60 && aggregateScores.values.quality > 60) {
      insights.opportunities.push('Focus on quality-driven processes and deliverables');
    }

    return insights;
  }

  // Update team member status
  static async updateMemberStatus(teamId: string, userId: string, status: TeamMemberStatus) {
    return await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: {
        status,
        ...(status === TeamMemberStatus.COMPLETED && { joinedAt: new Date() }),
      },
    });
  }

  // Get user's teams
  static async getUserTeams(userId: string) {
    return await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
