import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// جلب بيانات الأدمن
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صلاحيات الأدمن
    const currentUser = await prisma.player.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    // جلب جميع اللاعبين مع سجلات الألعاب
    const players = await prisma.player.findMany({
      include: {
        gameRecords: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // حساب الإحصائيات
    const totalGames = await prisma.gameRecord.count();
    const totalPoints = players.reduce((sum, p) => sum + p.points, 0);
    const avgScore = players.length > 0 ? totalPoints / players.length : 0;

    return NextResponse.json({
      players,
      stats: {
        totalPlayers: players.length,
        totalGames,
        totalPoints,
        avgScore
      }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
