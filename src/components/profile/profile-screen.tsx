'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Star, Check, Lock, Pencil, X } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import Image from 'next/image';

// مسارات الصور الرمزية (18 صورة متاحة)
const AVATAR_IMAGES = [
  '/avatars/avatar-1.png',   // قطة
  '/avatars/avatar-2.png',   // كلب
  '/avatars/avatar-3.png',   // أرنب
  '/avatars/avatar-4.png',   // دب
  '/avatars/avatar-5.png',   // باندا
  '/avatars/avatar-6.png',   // أسد
  '/avatars/avatar-7.png',   // بومة
  '/avatars/avatar-8.png',   // ثعلب
  '/avatars/avatar-9.png',   // بطريق
  '/avatars/avatar-10.png',  // ضفدع
  '/avatars/avatar-11.png',  // فيل
  '/avatars/avatar-12.png',  // يونيكورن
  '/avatars/avatar-13.png',  // ديناصور
  '/avatars/avatar-14.png',  // أسد جديد
  '/avatars/avatar-15.png',  // باندا جديد
  '/avatars/avatar-16.png',  // يونيكورن جديد
  '/avatars/avatar-17.png',  // بومة جديد
  '/avatars/avatar-18.png',  // ديناصور جديد
];

// أسماء الصور للعرض
const AVATAR_NAMES = [
  'قطه', 'كلب', 'أرنب', 'دب', 'باندا',
  'أسد', 'بومة', 'ثعلب', 'بطريق', 'ضفدع',
  'فيل', 'يونيكورن', 'ديناصور',
  'أسد ملكي', 'باندا لطيف', 'حصان سحري', 'بومة حكيمة', 'ديناصور صغير'
];

// عدد الصور المتاحة
const TOTAL_AVATARS = AVATAR_IMAGES.length;

export function ProfileScreen() {
  const { player, dispatch } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [purchasingAvatar, setPurchasingAvatar] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarPrice, setAvatarPrice] = useState(100); // السعر من الإعدادات

  // جلب سعر الصورة من الإعدادات
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.avatarPrice) {
          setAvatarPrice(data.avatarPrice);
        }
      })
      .catch(console.error);
  }, []);

  // تحديث الاسم
  const handleSaveName = async () => {
    if (!editName.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      
      const data = await response.json();
      dispatch({ type: 'UPDATE_PLAYER_NAME', payload: data.name });
      setIsEditing(false);
      showMessage('success', 'تم تحديث الاسم بنجاح!');
    } catch {
      showMessage('error', 'حدث خطأ أثناء الحفظ');
    }
    setIsSaving(false);
  };

  // شراء صورة رمزية
  const handlePurchaseAvatar = async (avatarId: number) => {
    if (!player || player.purchasedAvatars.includes(avatarId)) return;
    
    if (player.points < avatarPrice) {
      showMessage('error', `نقاط غير كافية! تحتاج ${avatarPrice} نقطة`);
      return;
    }
    
    setPurchasingAvatar(avatarId);
    try {
      const response = await fetch('/api/player/purchase-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // تحديث بيانات اللاعب بدون تغيير الشاشة
        dispatch({ 
          type: 'UPDATE_PLAYER_DATA', 
          payload: {
            points: data.points,
            purchasedAvatars: data.purchasedAvatars,
            avatarId: data.avatarId
          }
        });
        showMessage('success', 'تم شراء الصورة بنجاح!');
      } else {
        showMessage('error', data.error || 'حدث خطأ أثناء الشراء');
      }
    } catch {
      showMessage('error', 'حدث خطأ أثناء الشراء');
    }
    setPurchasingAvatar(null);
  };

  // اختيار صورة رمزية (إذا كانت مشتراة)
  const handleSelectAvatar = async (avatarId: number) => {
    if (!player || !player.purchasedAvatars.includes(avatarId)) return;
    
    try {
      await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId })
      });
      
      dispatch({ type: 'UPDATE_PLAYER_AVATAR', payload: avatarId });
      showMessage('success', 'تم تغيير الصورة بنجاح!');
    } catch {
      showMessage('error', 'حدث خطأ');
    }
  };

  // عرض رسالة
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // الحصول على مسار الصورة
  const getAvatarImage = (avatarId: number): string => {
    const index = ((avatarId - 1) % TOTAL_AVATARS);
    return AVATAR_IMAGES[index];
  };

  if (!player) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-6">
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/80 backdrop-blur-md rounded-full">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-700">{player.points} نقطة</span>
          </div>
        </div>

        {/* رسالة */}
        {message && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 backdrop-blur-md ${
            message.type === 'success' 
              ? 'bg-green-100/90 text-green-700' 
              : 'bg-red-100/90 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* بطاقة الملف الشخصي */}
        <div className="max-w-md mx-auto w-full mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center gap-4">
              {/* الصورة الرمزية */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-purple-200">
                <Image
                  src={getAvatarImage(player.avatarId)}
                  alt="الصورة الرمزية"
                  fill
                  className="object-cover"
                />
              </div>

              {/* الاسم */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="أدخل اسمك"
                      maxLength={20}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="p-2 bg-green-500 text-white rounded-full active:scale-90"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-gray-300 text-gray-600 rounded-full active:scale-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-800">{player.name}</h2>
                    <button
                      onClick={() => {
                        setEditName(player.name);
                        setIsEditing(true);
                      }}
                      className="p-1 text-purple-500 hover:bg-purple-100 rounded-full active:scale-90"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-gray-500 mt-1">لديك {player.points} نقطة</p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الصور الرمزية */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">الصور الرمزية</h3>
              <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">
                سعر الصورة: {avatarPrice} نقطة
              </span>
            </div>

            {/* شبكة الصور */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
              {Array.from({ length: TOTAL_AVATARS }, (_, i) => i + 1).map((avatarId) => {
                const isPurchased = player.purchasedAvatars.includes(avatarId);
                const isSelected = player.avatarId === avatarId;
                const isPurchasing = purchasingAvatar === avatarId;

                return (
                  <button
                    key={avatarId}
                    onClick={() => {
                      if (isPurchased) {
                        handleSelectAvatar(avatarId);
                      } else {
                        handlePurchaseAvatar(avatarId);
                      }
                    }}
                    disabled={isPurchasing}
                    className={`
                      relative aspect-square rounded-2xl overflow-hidden shadow-lg
                      transition-all active:scale-90 hover:scale-105
                      ${isSelected ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
                      ${!isPurchased ? 'opacity-75' : ''}
                    `}
                  >
                    {/* الصورة */}
                    <div className="absolute inset-0">
                      <Image
                        src={getAvatarImage(avatarId)}
                        alt={AVATAR_NAMES[avatarId - 1] || `صورة ${avatarId}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* شارة المحدد */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* قفل لغير المشتراة */}
                    {!isPurchased && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                        {isPurchasing ? (
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="bg-white/90 rounded-full p-2">
                            <Lock className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* اسم الصورة */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 z-10">
                      <p className="text-white text-xs text-center font-medium truncate">
                        {AVATAR_NAMES[avatarId - 1] || `صورة ${avatarId}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* رسالة توضيحية */}
            <p className="text-center text-gray-500 text-sm mt-6">
              اضغط على صورة مقفلة لشرائها بـ {avatarPrice} نقطة 💫
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-purple-600/50 text-sm">
          اجمع النقاط واشتري صوراً جديدة! 🌟
        </footer>
      </div>
    </div>
  );
}
