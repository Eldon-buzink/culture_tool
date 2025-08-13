import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapCultureTraits } from '@/lib/culture';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, format = 'pdf' } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get team data
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            assessmentSubmissions: {
              orderBy: { completedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Calculate team averages
    const teamScores = calculateTeamAverages(team.members);
    const cultureInsights = mapCultureTraits(teamScores);
    const recommendations = generateTeamRecommendations(teamScores);

    // Generate report data
    const reportData = {
      team: {
        name: team.name,
        description: team.description,
        memberCount: team.members.length,
        createdAt: team.createdAt,
      },
      scores: teamScores,
      insights: cultureInsights,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    // Generate report based on format
    let report;
    if (format === 'pdf') {
      report = await generatePDFReport(reportData);
    } else if (format === 'json') {
      report = reportData;
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use "pdf" or "json"' },
        { status: 400 }
      );
    }

    // Save report to database
    await db.report.create({
      data: {
        teamId,
        format,
        data: reportData,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      report: format === 'json' ? report : { downloadUrl: report },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function calculateTeamAverages(members: any[]) {
  const scores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  let validSubmissions = 0;

  members.forEach(member => {
    if (member.assessmentSubmissions.length > 0) {
      const submission = member.assessmentSubmissions[0];
      scores.openness += submission.scores.openness || 0;
      scores.conscientiousness += submission.scores.conscientiousness || 0;
      scores.extraversion += submission.scores.extraversion || 0;
      scores.agreeableness += submission.scores.agreeableness || 0;
      scores.neuroticism += submission.scores.neuroticism || 0;
      validSubmissions++;
    }
  });

  if (validSubmissions > 0) {
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.round(scores[key as keyof typeof scores] / validSubmissions);
    });
  }

  return scores;
}

function generateTeamRecommendations(scores: Record<string, number>): Array<{
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations = [];

  // Team collaboration recommendations
  if (scores.agreeableness < 60) {
    recommendations.push({
      id: 'team-1',
      title: 'Improve Team Collaboration',
      description: 'Focus on building trust and cooperation among team members',
      priority: 'high',
    });
  }

  // Communication recommendations
  if (scores.extraversion < 50) {
    recommendations.push({
      id: 'team-2',
      title: 'Enhance Communication Channels',
      description: 'Implement structured communication protocols and regular team meetings',
      priority: 'medium',
    });
  }

  // Innovation recommendations
  if (scores.openness < 55) {
    recommendations.push({
      id: 'team-3',
      title: 'Foster Innovation Culture',
      description: 'Create opportunities for creative thinking and experimentation',
      priority: 'medium',
    });
  }

  // Process improvement recommendations
  if (scores.conscientiousness < 65) {
    recommendations.push({
      id: 'team-4',
      title: 'Strengthen Process Management',
      description: 'Implement clear workflows and accountability measures',
      priority: 'high',
    });
  }

  return recommendations;
}

async function generatePDFReport(data: any): Promise<string> {
  // TODO: Implement PDF generation
  // This would typically use a library like puppeteer or jsPDF
  // For now, return a placeholder
  return '/api/reports/download/placeholder.pdf';
}
