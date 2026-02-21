import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// جلب الإعدادات (للجميع)
export async function GET() {
  try {
    // جلب كل الإعدادات مرة واحدة
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: { in: ['avatarPrice', 'pointsPerAnswer'] }
      }
    });
    
    console.log('📋 Raw settings from DB:', settings);
    
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));
    
    const avatarPrice = settingsMap.get('avatarPrice');
    const pointsPerAnswer = settingsMap.get('pointsPerAnswer');
    
    const result = {
      avatarPrice: avatarPrice ? Number(avatarPrice) : 100,
      pointsPerAnswer: pointsPerAnswer ? Number(pointsPerAnswer) : 1
    };
    
    console.log('📋 Returning settings:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // رجع القيم الافتراضية في حالة الخطأ
    return NextResponse.json({
      avatarPrice: 100,
      pointsPerAnswer: 1
    });
  }
}

// حفظ الإعدادات (للأدمن فقط)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // التحقق من صلاحيات الأدمن
    const player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!player?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { avatarPrice, pointsPerAnswer } = body;
    
    console.log('💾 Saving settings:', { avatarPrice, pointsPerAnswer });
    
    // حفظ سعر الصورة
    if (avatarPrice !== undefined) {
      const saved = await prisma.systemSettings.upsert({
        where: { key: 'avatarPrice' },
        update: { value: String(avatarPrice) },
        create: { key: 'avatarPrice', value: String(avatarPrice) }
      });
      console.log('💾 Saved avatarPrice:', saved);
    }
    
    // حفظ نقاط الإجابة
    if (pointsPerAnswer !== undefined) {
      const saved = await prisma.systemSettings.upsert({
        where: { key: 'pointsPerAnswer' },
        update: { value: String(pointsPerAnswer) },
        create: { key: 'pointsPerAnswer', value: String(pointsPerAnswer) }
      });
      console.log('💾 Saved pointsPerAnswer:', saved);
    }
    
    // التحقق من الحفظ
    const verifySettings = await prisma.systemSettings.findMany({
      where: { key: { in: ['avatarPrice', 'pointsPerAnswer'] } }
    });
    console.log('💾 Verified settings in DB:', verifySettings);
    
    return NextResponse.json({ 
      success: true,
      avatarPrice: avatarPrice,
      pointsPerAnswer: pointsPerAnswer
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
