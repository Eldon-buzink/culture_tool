import { NextRequest, NextResponse } from 'next/server';
import { sendTeamMemberCompletionNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { teamCode, memberEmail, memberName, teamName, teamCreatorEmail } = await request.json();

    if (!teamCode || !memberEmail || !memberName || !teamName || !teamCreatorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate the dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/${teamCode}/dashboard`;

    // Send the completion notification email
    const result = await sendTeamMemberCompletionNotification({
      teamCreatorName: 'Team Creator', // We could fetch this from the database if needed
      teamCreatorEmail,
      teamName,
      memberName,
      memberEmail,
      teamCode,
      dashboardUrl
    });

    if (result.success) {
      console.log('Team member completion notification sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Completion notification sent successfully' 
      });
    } else {
      console.error('Failed to send completion notification:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send completion notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending completion notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send completion notification' },
      { status: 500 }
    );
  }
}