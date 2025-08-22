import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            assessments: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error listing teams:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list teams',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
