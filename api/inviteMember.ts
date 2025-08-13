import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, emails } = body;

    if (!teamId || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Team ID and emails array are required' },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const invitations = [];
    const errors = [];

    for (const email of emails) {
      try {
        // Check if user already exists
        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Create new user
          user = await db.user.create({
            data: {
              email,
              name: email.split('@')[0], // Use email prefix as name
            },
          });
        }

        // Check if already invited
        const existingInvitation = await db.teamInvitation.findFirst({
          where: {
            teamId,
            userId: user.id,
          },
        });

        if (existingInvitation) {
          errors.push(`${email}: Already invited`);
          continue;
        }

        // Create invitation
        const invitation = await db.teamInvitation.create({
          data: {
            teamId,
            userId: user.id,
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });

        invitations.push({
          id: invitation.id,
          email,
          status: 'invited',
        });

        // TODO: Send email invitation
        // await sendInvitationEmail(email, team.name, invitation.id);

      } catch (error) {
        console.error(`Error inviting ${email}:`, error);
        errors.push(`${email}: Failed to invite`);
      }
    }

    return NextResponse.json({
      success: true,
      invitations,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error inviting members:', error);
    return NextResponse.json(
      { error: 'Failed to invite members' },
      { status: 500 }
    );
  }
}
