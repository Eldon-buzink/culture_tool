import { NextRequest, NextResponse } from 'next/server';

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

    // For now, just return a mock success response to test the endpoint
    // This will help us determine if the issue is with the API endpoint itself or the database operations
    console.log('Returning mock success response for testing');
    
    const mockTeamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return NextResponse.json({ 
      success: true, 
      team: {
        id: `mock-${Date.now()}`,
        name: name,
        code: mockTeamCode,
        description: description || ''
      },
      message: 'Mock team created successfully - database operations temporarily disabled for debugging'
    });

  } catch (error) {
    console.error('Error in team creation API:', error);
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
