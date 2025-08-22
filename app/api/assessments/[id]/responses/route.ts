import { NextRequest, NextResponse } from 'next/server';
import { saveResponse, getAssessmentResponses, getAssessmentById } from '@/lib/data-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, section, questionId, response } = body;

    if (!userId || !section || !questionId || response === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate assessment exists
    const assessment = await getAssessmentById(id);
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Save the response
    const savedResponse = await saveResponse({
      assessmentId: id,
      userId,
      section,
      questionId,
      response
    });

    return NextResponse.json({
      success: true,
      response: savedResponse
    });

  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const responses = await getAssessmentResponses(id, userId);

    return NextResponse.json({
      success: true,
      responses
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
