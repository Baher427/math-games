import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// الحصول على بيانات اللاعب الحالي
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // تحويل purchasedAvatars من string إلى array
    const playerData = {
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      points: player.points,
      purchasedAvatars: player.purchasedAvatars.split(',').map(Number),
      isAdmin: player.isAdmin
    };
    
    return NextResponse.json(playerData);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}

// تحديث بيانات اللاعب
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, avatarId, points, purchasedAvatars } = body;
    
    const updateData: {
      name?: string;
      avatarId?: number;
      points?: number;
      purchasedAvatars?: string;
    } = {};
    
    if (name !== undefined) updateData.name = name;
    if (avatarId !== undefined) updateData.avatarId = avatarId;
    if (points !== undefined) updateData.points = points;
    if (purchasedAvatars !== undefined) updateData.purchasedAvatars = purchasedAvatars.join(',');
    
    const player = await prisma.player.update({
      where: { id: session.user.id },
      data: updateData
    });
    
    // تحويل purchasedAvatars من string إلى array
    const playerData = {
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      points: player.points,
      purchasedAvatars: player.purchasedAvatars.split(',').map(Number),
      isAdmin: player.isAdmin
    };
    
    return NextResponse.json(playerData);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}
