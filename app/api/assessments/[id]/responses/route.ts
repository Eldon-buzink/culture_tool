import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { responses } = await request.json();
    const assessmentId = params.id;

    // Validate assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Store responses in database
    const responsePromises = Object.entries(responses).map(([questionId, response]) =>
      prisma.assessmentResponse.upsert({
        where: {
          assessmentId_questionId: {
            assessmentId,
            questionId
          }
        },
        update: {
          response: response as number
        },
        create: {
          assessmentId,
          questionId,
          response: response as number
        }
      })
    );

    await Promise.all(responsePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store responses' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = params.id;

    // Get responses from database
    const responses = await prisma.assessmentResponse.findMany({
      where: { assessmentId },
      select: {
        questionId: true,
        response: true
      }
    });

    // Convert to expected format
    const responseMap = responses.reduce((acc, response) => {
      acc[response.questionId] = response.response;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ success: true, responses: responseMap });
  } catch (error) {
    console.error('Error retrieving responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve responses' },
      { status: 500 }
    );
  }
}
