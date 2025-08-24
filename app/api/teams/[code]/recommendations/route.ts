import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { AIService } from '@/lib/services/aiService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { teamScores, memberCount } = await request.json();

    if (!teamScores || !memberCount) {
      return NextResponse.json(
        { success: false, error: 'Team scores and member count are required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // Find the team
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('id')
      .eq('code', code)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Generate AI team recommendations
    let teamRecommendations;
    try {
      teamRecommendations = await AIService.generateTeamInsights(teamScores, memberCount);
    } catch (error) {
      console.error('Failed to generate AI team recommendations:', error);
      // Use fallback recommendations if AI fails
      teamRecommendations = {
        strengths: ['Team assessment in progress'],
        challenges: ['Complete individual assessments to see team insights'],
        opportunities: ['Invite team members to participate'],
        summary: 'Team insights are being processed. Please check back later.'
      };
    }

    // Store team recommendations in the database
    const { error: updateError } = await admin
      .from('teams')
      .update({
        team_recommendations: JSON.stringify(teamRecommendations)
      })
      .eq('id', team.id);

    if (updateError) {
      console.error('Failed to update team recommendations:', updateError);
    }

    return NextResponse.json({
      success: true,
      recommendations: teamRecommendations
    });

  } catch (error) {
    console.error('Error generating team recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate team recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const admin = createSupabaseAdmin();

    // Find the team
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('id, name, code, team_recommendations')
      .eq('code', code)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get team member count
    const { count: memberCount } = await admin
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    // Get assessment count
    const { count: assessmentCount } = await admin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    // Check if we have stored recommendations
    if (team.team_recommendations) {
      const storedRecommendations = JSON.parse(team.team_recommendations);
      return NextResponse.json({
        success: true,
        recommendations: storedRecommendations,
        team: {
          id: team.id,
          name: team.name,
          code: team.code,
          memberCount: memberCount || 0,
          assessmentCount: assessmentCount || 0
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Team recommendations need to be generated. Use POST to generate them.',
        team: {
          id: team.id,
          name: team.name,
          code: team.code,
          memberCount: memberCount || 0,
          assessmentCount: assessmentCount || 0
        }
      });
    }

  } catch (error) {
    console.error('Error fetching team recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team recommendations' },
      { status: 500 }
    );
  }
}
