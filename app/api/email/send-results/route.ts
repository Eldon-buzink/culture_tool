import { NextRequest, NextResponse } from 'next/server';
import { sendAssessmentResults, AssessmentResultsEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipientName, 
      recipientEmail, 
      assessmentId, 
      resultsUrl, 
      oceanScores, 
      cultureScores, 
      valuesScores, 
      topInsights 
    } = body;

    // Validate required fields
    if (!recipientEmail || !assessmentId || !resultsUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailData: AssessmentResultsEmailData = {
      recipientName: recipientName || 'Assessment User',
      recipientEmail,
      assessmentId,
      resultsUrl,
      oceanScores: oceanScores || {},
      cultureScores: cultureScores || {},
      valuesScores: valuesScores || {},
      topInsights: topInsights || []
    };

    const result = await sendAssessmentResults(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Assessment results email sent successfully',
        data: result.data
      });
    } else {
      // Check if it's a configuration error
      if (result.error === 'Resend not configured') {
        return NextResponse.json(
          { success: false, error: 'Email service not configured. Please contact support.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending assessment results email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
