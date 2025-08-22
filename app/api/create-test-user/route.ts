import { NextResponse } from 'next/server';
import { createUser } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 });
    }

    // Create a user with the provided data
    const user = await createUser({
      email,
      name
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Create a test user
    const user = await createUser({
      email: 'test-user@example.com',
      name: 'Test User'
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
