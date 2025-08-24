import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    const { data: assessment, error: assessmentError } = await admin
      .from('assessments')
      .select(`
        *,
        users:user_id(id, name, email),
        teams:team_id(id, name, code)
      `)
      .eq('id', id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: 'Assessment',
        description: 'Team member assessment',
        type: assessment.team_id ? 'team' : 'individual',
        status: assessment.status,
        createdBy: assessment.user_id,
        createdAt: assessment.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
