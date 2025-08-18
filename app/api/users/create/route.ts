import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: true, user: { id: existingUser.id, name: existingUser.name } },
        { status: 200 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name } 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
