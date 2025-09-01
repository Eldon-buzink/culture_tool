import { NextRequest, NextResponse } from 'next/server';
import { sendCandidateInvitation, CandidateInvitationEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    console.log('Candidate Email API - Environment check:');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
    
    const body = await request.json();
    const { 
      candidateName, 
      candidateEmail, 
      candidatePosition,
      teamName, 
      teamCode, 
      assessmentUrl 
    } = body;

    console.log('Candidate Email API - Request body:', body);

    // Validate required fields
    if (!candidateName || !candidateEmail || !candidatePosition || !teamName || !teamCode || !assessmentUrl) {
      console.error('Candidate Email API - Missing required fields:', { candidateName, candidateEmail, candidatePosition, teamName, teamCode, assessmentUrl });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      console.error('Candidate Email API - Invalid email format:', candidateEmail);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailData: CandidateInvitationEmailData = {
      candidateName,
      candidateEmail,
      candidatePosition,
      teamName,
      teamCode,
      assessmentUrl
    };

    console.log('Candidate Email API - Calling sendCandidateInvitation with:', emailData);
    const result = await sendCandidateInvitation(emailData);
    console.log('Candidate Email API - sendCandidateInvitation result:', result);

    if (result.success) {
      console.log('Candidate Email API - Successfully sent email to:', candidateEmail);
      return NextResponse.json({
        success: true,
        message: 'Candidate invitation email sent successfully',
        data: result.data
      });
    } else {
      console.error('Candidate Email API - Failed to send email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Candidate Email API - Error sending candidate invitation email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
