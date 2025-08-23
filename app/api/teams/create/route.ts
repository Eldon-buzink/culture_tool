import { NextRequest, NextResponse } from 'next/server';

// Temporary in-memory storage for teams (this will reset when the server restarts)
let teams: any[] = [];
let users: any[] = [];
let teamMembers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    console.log('Team creation request received');
    const { name, description, memberEmails } = await request.json();
    console.log('Request data:', { name, description, memberEmails });

    // Validate input
    if (!name) {
      console.log('Validation failed: Team name is required');
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    console.log('Creating team leader user...');
    // Create default team leader user
    const creator = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Team Leader',
      email: `team-leader-${Date.now()}@temp.com`,
      createdAt: new Date()
    };
    users.push(creator);
    console.log('Team leader user created:', creator.id);

    // Generate unique team code
    let teamCode = '';
    let isUnique = false;
    
    console.log('Generating unique team code...');
    while (!isUnique) {
      teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingTeam = teams.find(t => t.code === teamCode);
      if (!existingTeam) {
        isUnique = true;
      }
    }
    console.log('Team code generated:', teamCode);

    console.log('Creating team...');
    // Create the team
    const newTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || '',
      code: teamCode,
      createdAt: new Date()
    };
    teams.push(newTeam);
    console.log('Team created:', newTeam.id);

    console.log('Adding team leader as member...');
    // Add creator as first member
    const ownerMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId: newTeam.id,
      userId: creator.id,
      role: 'owner',
      joinedAt: new Date()
    };
    teamMembers.push(ownerMember);
    console.log('Team leader added as member');

    // Add other members
    if (memberEmails && memberEmails.length > 0) {
      console.log('Processing member emails:', memberEmails);
      for (const email of memberEmails) {
        if (email && email.trim() && email.includes('@')) {
          console.log('Processing email:', email);
          // Find or create user
          let user = users.find(u => u.email === email.trim());

          if (!user) {
            console.log('Creating new user for email:', email);
            user = {
              id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              email: email.trim(),
              name: email.split('@')[0], // Use email prefix as name
              createdAt: new Date()
            };
            users.push(user);
            console.log('New user created:', user.id);
          } else {
            console.log('Existing user found:', user.id);
          }

          console.log('Adding member to team:', user.id);
          // Add member
          const member = {
            id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            teamId: newTeam.id,
            userId: user.id,
            role: 'member',
            joinedAt: new Date()
          };
          teamMembers.push(member);
          console.log('Member added successfully');
        }
      }
    }

    console.log('Team creation completed successfully');
    console.log('Current teams:', teams.length);
    console.log('Current users:', users.length);
    console.log('Current team members:', teamMembers.length);
    
    return NextResponse.json({ 
      success: true, 
      team: {
        id: newTeam.id,
        name: newTeam.name,
        code: newTeam.code,
        description: newTeam.description
      }
    });

  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
