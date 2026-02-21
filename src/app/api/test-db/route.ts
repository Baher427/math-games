import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('🧪 Test DB API called');
  
  const result = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 50)}...` : 'Missing',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    },
    connection: 'Testing...',
    players: null,
    error: null,
  };

  try {
    // Test connection
    await prisma.$connect();
    result.connection = 'Connected ✓';
    
    // Test query
    const players = await prisma.player.findMany({
      take: 5
    });
    result.players = players;
    
  } catch (error) {
    result.connection = 'Failed ✗';
    result.error = error instanceof Error ? error.message : String(error);
    console.error('🧪 DB Error:', error);
  }

  return NextResponse.json(result, { status: 200 });
}
