import { Resend } from 'resend';

// Lazy initialization to avoid errors when API key is not available
let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found in environment variables');
      return null;
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface AssessmentResultsEmailData {
  recipientName: string;
  recipientEmail: string;
  assessmentId: string;
  resultsUrl: string;
  oceanScores: Record<string, number>;
  cultureScores: Record<string, number>;
  valuesScores: Record<string, number>;
  topInsights: string[];
}

export interface TeamInvitationEmailData {
  recipientName: string;
  recipientEmail: string;
  teamName: string;
  teamCode: string;
  inviterName: string;
  assessmentUrl: string;
}

export async function sendEmail(emailData: EmailData) {
  try {
    console.log('Email service - Starting email send to:', emailData.to);
    
    const resendInstance = getResend();
    if (!resendInstance) {
      console.error('Email service - Resend not initialized - missing API key');
      return { success: false, error: 'Resend not configured' };
    }

    console.log('Email service - Resend instance created, sending email...');
    console.log('Email service - From:', process.env.RESEND_FROM_EMAIL || 'noreply@culturemapping.com');
    console.log('Email service - To:', emailData.to);
    console.log('Email service - Subject:', emailData.subject);

    const result = await resendInstance.emails.send({
      from: emailData.from || process.env.RESEND_FROM_EMAIL || 'noreply@culturemapping.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    console.log('Email service - Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email service - Failed to send email:', error);
    return { success: false, error };
  }
}

export function generateAssessmentResultsEmail(data: AssessmentResultsEmailData): EmailData {
  const topScore = Math.max(...Object.values(data.oceanScores));
  const topTrait = Object.keys(data.oceanScores).find(key => data.oceanScores[key] === topScore);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Assessment Results</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .score-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Your Assessment Results Are Ready!</h1>
          <p>Hi ${data.recipientName}, your comprehensive personality and culture assessment is complete.</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <h3>🔍 Key Insight</h3>
            <p>Your strongest trait is <strong>${topTrait}</strong> (${topScore}/100), indicating ${getTraitDescription(topTrait)}.</p>
          </div>
          
          <h2>📊 Your Assessment Summary</h2>
          <p>You've completed our comprehensive assessment covering:</p>
          <ul>
            <li><strong>Personality Traits (OCEAN):</strong> Understanding your natural work style</li>
            <li><strong>Cultural Preferences:</strong> How you prefer to work within organizations</li>
            <li><strong>Work Values:</strong> What motivates and drives you professionally</li>
          </ul>
          
          <div class="score-card">
            <h3>🏆 Top Insights</h3>
            <ul>
              ${data.topInsights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.resultsUrl}" class="cta-button">View Full Results</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This link will take you to your detailed results page where you can explore your scores, 
            read personalized insights, and discover actionable recommendations for your career and workplace.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Culture Mapping. All rights reserved.</p>
          <p>This email was sent to ${data.recipientEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    subject: `Your Assessment Results - ${data.recipientName}`,
    html: html,
  };
}

export function generateTeamInvitationEmail(data: TeamInvitationEmailData): EmailData {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Assessment Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .team-code { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #667eea; }
        .code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 3px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .benefits { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👥 You're Invited to a Team Assessment!</h1>
          <p>Hi ${data.recipientName}, you've been invited to join a comprehensive team assessment.</p>
        </div>
        
        <div class="content">
          <h2>📋 Assessment Details</h2>
          <p><strong>Team:</strong> ${data.teamName}</p>
          <p><strong>Invited by:</strong> ${data.inviterName}</p>
          
          <div class="team-code">
            <h3>🔑 Your Team Code</h3>
            <div class="code">${data.teamCode}</div>
            <p style="margin-top: 10px; font-size: 14px;">Use this code to join the team assessment</p>
          </div>
          
          <div class="benefits">
            <h3>🎯 What You'll Discover</h3>
            <ul>
              <li><strong>Your Personality Profile:</strong> Understand your natural work style and communication preferences</li>
              <li><strong>Cultural Preferences:</strong> Learn how you prefer to work within organizational structures</li>
              <li><strong>Work Values:</strong> Identify what truly motivates you professionally</li>
              <li><strong>Team Dynamics:</strong> See how your traits complement your team members</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.assessmentUrl}" class="cta-button">Start Your Assessment</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            The assessment takes approximately 15-20 minutes to complete. Your responses will help the team 
            understand dynamics, improve collaboration, and optimize work processes.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Culture Mapping. All rights reserved.</p>
          <p>This email was sent to ${data.recipientEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    subject: `Team Assessment Invitation - ${data.teamName}`,
    html: html,
  };
}

function getTraitDescription(trait: string | undefined): string {
  const descriptions: Record<string, string> = {
    'openness': 'creativity and adaptability to new experiences',
    'conscientiousness': 'organization and attention to detail',
    'extraversion': 'social energy and collaborative work style',
    'agreeableness': 'cooperation and team harmony',
    'neuroticism': 'emotional sensitivity and stress response'
  };
  
  return descriptions[trait || 'openness'] || 'unique personality characteristics';
}

// Convenience functions for common email operations
export async function sendAssessmentResults(data: AssessmentResultsEmailData) {
  const emailData = generateAssessmentResultsEmail(data);
  return await sendEmail(emailData);
}

export async function sendTeamInvitation(data: TeamInvitationEmailData) {
  const emailData = generateTeamInvitationEmail(data);
  return await sendEmail(emailData);
}
