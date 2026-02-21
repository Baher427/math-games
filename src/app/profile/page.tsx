'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star, Check, Lock, Pencil, X } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { usePlayerSync } from '@/hooks/use-player-sync';
import Image from 'next/image';

// مسارات الصور الرمزية (18 صورة متاحة)
const AVATAR_IMAGES = [
  '/avatars/avatar-1.png', '/avatars/avatar-2.png', '/avatars/avatar-3.png',
  '/avatars/avatar-4.png', '/avatars/avatar-5.png', '/avatars/avatar-6.png',
  '/avatars/avatar-7.png', '/avatars/avatar-8.png', '/avatars/avatar-9.png',
  '/avatars/avatar-10.png', '/avatars/avatar-11.png', '/avatars/avatar-12.png',
  '/avatars/avatar-13.png', '/avatars/avatar-14.png', '/avatars/avatar-15.png',
  '/avatars/avatar-16.png', '/avatars/avatar-17.png', '/avatars/avatar-18.png',
];

// أسماء الصور للعرض
const AVATAR_NAMES = [
  'قطه', 'كلب', 'أرنب', 'دب', 'باندا',
  'أسد', 'بومة', 'ثعلب', 'بطريق', 'ضفدع',
  'فيل', 'يونيكورن', 'ديناصور',
  'أسد ملكي', 'باندا لطيف', 'حصان سحري', 'بومة حكيمة', 'ديناصور صغير'
];

const TOTAL_AVATARS = AVATAR_IMAGES.length;

export default function ProfilePage() {
  const router = useRouter();
  const { player, dispatch } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [purchasingAvatar, setPurchasingAvatar] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarPrice, setAvatarPrice] = useState(100);

  // تزامن البيانات
  usePlayerSync(15000);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.avatarPrice) setAvatarPrice(data.avatarPrice);
      })
      .catch(console.error);
  }, []);

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
      dispatch({ type: 'UPDATE_PLAYER_DATA', payload: { name: data.name } });
      setIsEditing(false);
      showMessage('success', 'تم تحديث الاسم بنجاح!');
    } catch {
      showMessage('error', 'حدث خطأ أثناء الحفظ');
    }
    setIsSaving(false);
  };

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

  const handleSelectAvatar = async (avatarId: number) => {
    if (!player || !player.purchasedAvatars.includes(avatarId)) return;
    try {
      await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId })
      });
      dispatch({ type: 'UPDATE_PLAYER_DATA', payload: { avatarId } });
      showMessage('success', 'تم تغيير الصورة بنجاح!');
    } catch {
      showMessage('error', 'حدث خطأ');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getAvatarImage = (avatarId: number): string => {
    return AVATAR_IMAGES[((avatarId - 1) % TOTAL_AVATARS)];
  };

  if (!player) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {/* الشريط العلوي */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors active:scale-95"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium">العودة</span>
        </button>
      </div>

      {/* رسالة */}
      {message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 backdrop-blur-md ${
          message.type === 'success' ? 'bg-green-100/90 text-green-700' : 'bg-red-100/90 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* بطاقة الملف الشخصي */}
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-purple-200">
              <Image src={getAvatarImage(player.avatarId)} alt="الصورة الرمزية" fill className="object-cover" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
                    maxLength={20}
                  />
                  <button onClick={handleSaveName} disabled={isSaving} className="p-2 bg-green-500 text-white rounded-full active:scale-90">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-300 text-gray-600 rounded-full active:scale-90">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800">{player.name}</h2>
                  <button onClick={() => { setEditName(player.name); setIsEditing(true); }} className="p-1 text-purple-500 hover:bg-purple-100 rounded-full active:scale-90">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1 text-amber-600">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{player.points} نقطة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الصور الرمزية */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">الصور الرمزية</h3>
          <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">
            سعر الصورة: {avatarPrice} نقطة
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {Array.from({ length: TOTAL_AVATARS }, (_, i) => i + 1).map((avatarId) => {
            const isPurchased = player.purchasedAvatars.includes(avatarId);
            const isSelected = player.avatarId === avatarId;
            const isPurchasing = purchasingAvatar === avatarId;

            return (
              <button
                key={avatarId}
                onClick={() => isPurchased ? handleSelectAvatar(avatarId) : handlePurchaseAvatar(avatarId)}
                disabled={isPurchasing}
                className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-all active:scale-90 hover:scale-105 ${isSelected ? 'ring-4 ring-purple-500 ring-offset-2' : ''} ${!isPurchased ? 'opacity-75' : ''}`}
              >
                <div className="absolute inset-0">
                  <Image src={getAvatarImage(avatarId)} alt={AVATAR_NAMES[avatarId - 1]} fill className="object-cover" />
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 z-10">
                  <p className="text-white text-xs text-center font-medium truncate">{AVATAR_NAMES[avatarId - 1]}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          اضغط على صورة مقفلة لشرائها بـ {avatarPrice} نقطة 💫
        </p>
      </div>
    </div>
  );
}
