import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isBlocked: false });
    }
    
    const player = await prisma.player.findUnique({
      where: { id: session.user.id },
      select: { isBlocked: true, blockedReason: true }
    });
    
    if (player?.isBlocked) {
      return NextResponse.json({ 
        isBlocked: true, 
        blockedReason: player.blockedReason 
      });
    }
    
    return NextResponse.json({ isBlocked: false });
  } catch (error) {
    console.error('Error checking blocked status:', error);
    return NextResponse.json({ isBlocked: false });
  }
}
