import { NextRequest, NextResponse } from 'next/server';
import { createAssessment, getAssessmentById } from '@/lib/data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, createdBy, teamId } = body;

    if (!title || !type || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assessment = await createAssessment({
      title,
      description,
      type,
      createdBy,
      teamId
    });

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const assessment = await getAssessmentById(id);
    
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        status: assessment.status,
        createdAt: assessment.createdAt,
        team: assessment.team,
        responses: assessment.responses
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
