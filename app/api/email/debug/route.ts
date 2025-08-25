import { NextRequest, NextResponse } from 'next/server';
import { sendTeamInvitation, TeamInvitationEmailData } from '@/lib/email';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      NODE_ENV: process.env.NODE_ENV,
      DEBUG_API: process.env.DEBUG_API
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Email configuration check complete'
    });
  } catch (error) {
    console.error('Email debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'testEmail is required'
      }, { status: 400 });
    }

    console.log('Email debug - Testing email to:', testEmail);

    // Test email data
    const testEmailData: TeamInvitationEmailData = {
      recipientName: 'Test User',
      recipientEmail: testEmail,
      teamName: 'Test Team',
      teamCode: 'TEST123',
      inviterName: 'Test Leader',
      assessmentUrl: 'https://example.com/assessment'
    };

    console.log('Email debug - Sending test email with data:', testEmailData);

    const result = await sendTeamInvitation(testEmailData);

    console.log('Email debug - Test email result:', result);

    return NextResponse.json({
      success: true,
      testResult: result,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Email debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
