import { NextRequest, NextResponse } from 'next/server';
import { sendTeamInvitation, TeamInvitationEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipientName, 
      recipientEmail, 
      teamName, 
      teamCode, 
      inviterName, 
      assessmentUrl 
    } = body;

    // Validate required fields
    if (!recipientName || !recipientEmail || !teamName || !teamCode || !inviterName || !assessmentUrl) {
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

    const emailData: TeamInvitationEmailData = {
      recipientName,
      recipientEmail,
      teamName,
      teamCode,
      inviterName,
      assessmentUrl
    };

    const result = await sendTeamInvitation(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Team invitation email sent successfully',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending team invitation email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
