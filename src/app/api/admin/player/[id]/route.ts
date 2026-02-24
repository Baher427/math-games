import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// حذف لاعب
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!player?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = await params;
    
    await prisma.player.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}

// تحديث لاعب (حظر، إضافة نقاط، إزالة نقاط، تصفير، أدمن)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { 
      isBlocked, 
      blockedReason, 
      addPoints, 
      removePoints, 
      resetPoints,
      isAdmin 
    } = body;
    
    // منع تعديل نفسك كأدمن
    if (id === session.user.id && isAdmin !== undefined) {
      return NextResponse.json({ error: 'Cannot modify your own admin status' }, { status: 400 });
    }

    // معالجة الحظر
    if (isBlocked !== undefined) {
      await prisma.player.update({
        where: { id },
        data: {
          isBlocked: isBlocked,
          blockedReason: isBlocked ? blockedReason || null : null
        }
      });
      
      console.log(`🚫 Admin ${admin.id} ${isBlocked ? 'blocked' : 'unblocked'} player ${id}. Reason: ${blockedReason || 'N/A'}`);
    }
    
    // معالجة إضافة نقاط
    if (addPoints !== undefined && addPoints > 0) {
      await prisma.player.update({
        where: { id },
        data: {
          points: { increment: addPoints }
        }
      });
      console.log(`➕ Admin ${admin.id} added ${addPoints} points to player ${id}`);
    }
    
    // معالجة إزالة نقاط
    if (removePoints !== undefined && removePoints > 0) {
      const currentPlayer = await prisma.player.findUnique({ 
        where: { id },
        select: { points: true }
      });
      
      if (currentPlayer) {
        const newPoints = Math.max(0, currentPlayer.points - removePoints);
        await prisma.player.update({
          where: { id },
          data: { points: newPoints }
        });
        console.log(`➖ Admin ${admin.id} removed ${removePoints} points from player ${id}`);
      }
    }
    
    // معالجة تصفير النقاط
    if (resetPoints) {
      await prisma.player.update({
        where: { id },
        data: { points: 0 }
      });
      console.log(`🔄 Admin ${admin.id} reset points for player ${id}`);
    }
    
    // معالجة تغيير صلاحيات الأدمن
    if (isAdmin !== undefined) {
      await prisma.player.update({
        where: { id },
        data: { isAdmin: isAdmin }
      });
      console.log(`👑 Admin ${admin.id} ${isAdmin ? 'granted' : 'revoked'} admin status for player ${id}`);
    }
    
    // جلب البيانات المحدثة
    const updatedPlayer = await prisma.player.findUnique({
      where: { id },
      include: {
        gameRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!updatedPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: updatedPlayer.id,
      name: updatedPlayer.name,
      email: updatedPlayer.email,
      points: updatedPlayer.points,
      isAdmin: updatedPlayer.isAdmin,
      isBlocked: updatedPlayer.isBlocked,
      blockedReason: updatedPlayer.blockedReason,
      gameRecords: updatedPlayer.gameRecords
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

// جلب تفاصيل لاعب
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!player?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = await params;
    
    const playerData = await prisma.player.findUnique({
      where: { id },
      include: {
        gameRecords: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    
    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...playerData,
      purchasedAvatars: playerData.purchasedAvatars.split(',').map(Number)
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}
