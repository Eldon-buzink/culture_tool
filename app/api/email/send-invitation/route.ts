import { NextRequest, NextResponse } from 'next/server';
import { sendTeamInvitation, TeamInvitationEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    console.log('Email API - Environment check:');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
    
    const body = await request.json();
    const { 
      recipientName, 
      recipientEmail, 
      teamName, 
      teamCode, 
      inviterName, 
      assessmentUrl 
    } = body;

    console.log('Email API - Request body:', body);

    // Validate required fields
    if (!recipientName || !recipientEmail || !teamName || !teamCode || !inviterName || !assessmentUrl) {
      console.error('Email API - Missing required fields:', { recipientName, recipientEmail, teamName, teamCode, inviterName, assessmentUrl });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.error('Email API - Invalid email format:', recipientEmail);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailData: TeamInvitationEmailData = {
      recipientName,
      recipientEmail,
      teamName,
      teamCode,
      inviterName,
      assessmentUrl
    };

    console.log('Email API - Calling sendTeamInvitation with:', emailData);
    const result = await sendTeamInvitation(emailData);
    console.log('Email API - sendTeamInvitation result:', result);

    if (result.success) {
      console.log('Email API - Successfully sent email to:', recipientEmail);
      return NextResponse.json({
        success: true,
        message: 'Team invitation email sent successfully',
        data: result.data
      });
    } else {
      console.error('Email API - Failed to send email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API - Error sending team invitation email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
