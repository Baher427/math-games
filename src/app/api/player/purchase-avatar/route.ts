import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { avatarId } = body;
    
    if (!avatarId || avatarId < 1 || avatarId > 50) {
      return NextResponse.json({ error: 'Invalid avatar ID' }, { status: 400 });
    }
    
    // جلب سعر الصورة من الإعدادات
    const avatarPriceSetting = await prisma.systemSettings.findUnique({
      where: { key: 'avatarPrice' }
    });
    
    console.log('🎨 Avatar price setting from DB:', avatarPriceSetting);
    
    const AVATAR_PRICE = avatarPriceSetting ? Number(avatarPriceSetting.value) : 100;
    
    console.log(`🎨 Using avatar price: ${AVATAR_PRICE}`);
    
    // البحث عن اللاعب
    const player = await prisma.player.findUnique({
      where: { id: session.user.id }
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // تحويل purchasedAvatars إلى array
    const purchasedAvatars = player.purchasedAvatars.split(',').map(Number);
    
    // التحقق إذا كانت الصورة مشتراة بالفعل
    if (purchasedAvatars.includes(avatarId)) {
      return NextResponse.json({ error: 'Avatar already purchased' }, { status: 400 });
    }
    
    // التحقق من وجود نقاط كافية
    if (player.points < AVATAR_PRICE) {
      return NextResponse.json({ 
        error: 'Not enough points',
        required: AVATAR_PRICE,
        current: player.points 
      }, { status: 400 });
    }
    
    // خصم النقاط وإضافة الصورة
    const updatedPlayer = await prisma.player.update({
      where: { id: player.id },
      data: {
        points: player.points - AVATAR_PRICE,
        avatarId: avatarId,
        purchasedAvatars: [...purchasedAvatars, avatarId].join(',')
      }
    });
    
    // تحويل purchasedAvatars من string إلى array
    const playerData = {
      ...updatedPlayer,
      purchasedAvatars: updatedPlayer.purchasedAvatars.split(',').map(Number)
    };
    
    return NextResponse.json(playerData);
  } catch (error) {
    console.error('Error purchasing avatar:', error);
    return NextResponse.json({ error: 'Failed to purchase avatar' }, { status: 500 });
  }
}
