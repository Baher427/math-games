import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// إضافة نقاط للاعب (تستخدم نقاط الإجابة من الإعدادات)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    let { points } = body;
    
    // جلب نقاط الإجابة من الإعدادات
    const pointsPerAnswerSetting = await prisma.systemSettings.findUnique({
      where: { key: 'pointsPerAnswer' }
    });
    
    console.log('🎮 Points setting from DB:', pointsPerAnswerSetting);
    
    const pointsPerAnswer = pointsPerAnswerSetting ? Number(pointsPerAnswerSetting.value) : 1;
    
    // لو النقاط مش محددة، استخدم القيمة من الإعدادات
    if (typeof points !== 'number' || points <= 0) {
      points = pointsPerAnswer;
    }
    
    console.log(`🎮 Adding ${points} points to player ${session.user.id} (setting: ${pointsPerAnswer})`);
    
    const player = await prisma.player.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: points
        }
      }
    });
    
    console.log(`✅ Added ${points} points to player ${session.user.id}. New total: ${player.points}`);
    
    return NextResponse.json({ 
      success: true,
      points: player.points,
      addedPoints: points,
      pointsPerAnswerSetting: pointsPerAnswer
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
  }
}
