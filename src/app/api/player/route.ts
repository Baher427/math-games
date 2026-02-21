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
    
    let player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    // لو الـ player مش موجود، ننشئ واحد جديد
    if (!player) {
      // نجيب بيانات الـ session
      const email = session.user.email;
      if (!email) {
        return NextResponse.json({ error: 'No email in session' }, { status: 400 });
      }
      
      const playerCount = await prisma.player.count();
      
      player = await prisma.player.create({
        data: {
          id: session.user.id,
          email: email,
          name: session.user.name || 'لاعب جديد',
          googleId: session.user.id,
          image: session.user.image,
          avatarId: 1,
          points: 0,
          purchasedAvatars: '1',
          isAdmin: playerCount === 0
        }
      });
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
