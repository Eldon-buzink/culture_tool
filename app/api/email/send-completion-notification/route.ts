import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { teamCode, memberEmail, memberName, teamName, teamCreatorEmail } = await request.json();

    if (!teamCode || !memberEmail || !memberName || !teamName || !teamCreatorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get team creator's name from the database
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('creator_name')
      .eq('code', teamCode)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    const creatorName = teamData.creator_name || 'Team Creator';

    // Email content
    const subject = `Team Member Completed Assessment - ${teamName}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Member Completed Assessment</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
            }
            .content {
              margin-bottom: 30px;
            }
            .highlight {
              background: #f0f9ff;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .member-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .team-code {
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 6px;
              font-family: monospace;
              font-weight: bold;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Culture Mapping</div>
              <h1 class="title">Assessment Completed! 🎉</h1>
              <p class="subtitle">A team member has finished their assessment</p>
            </div>
            
            <div class="content">
              <p>Hi ${creatorName},</p>
              
              <p>Great news! A team member has completed their assessment for your team <strong>${teamName}</strong>.</p>
              
              <div class="member-info">
                <h3 style="margin-top: 0; color: #374151;">Completed Assessment:</h3>
                <p><strong>Name:</strong> ${memberName}</p>
                <p><strong>Email:</strong> ${memberEmail}</p>
                <p><strong>Team:</strong> ${teamName}</p>
                <p><strong>Team Code:</strong> <span class="team-code">${teamCode}</span></p>
              </div>
              
              <div class="highlight">
                <h3 style="margin-top: 0; color: #1e40af;">What's Next?</h3>
                <p>You can now view the updated team insights and see how this member's results contribute to your team's overall culture profile.</p>
              </div>
              
              <p>Visit your team dashboard to explore the new insights and see how your team's culture is evolving!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/team/${teamCode}/dashboard" class="cta-button">
                  View Team Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent because a team member completed their assessment.</p>
              <p>If you have any questions, please don't hesitate to reach out.</p>
              <p style="margin-top: 20px;">
                <strong>Culture Mapping Team</strong><br>
                Building better teams through understanding
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Culture Mapping <noreply@culturemapping.app>',
        to: [teamCreatorEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData);

    return NextResponse.json({
      success: true,
      message: 'Completion notification sent successfully',
      emailId: emailData.id
    });

  } catch (error) {
    console.error('Error sending completion notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
