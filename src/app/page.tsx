'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Gamepad2, Link2, CheckCircle2, User, Star, Plus, Minus, Divide, LogOut, Shield } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { GameType } from '@/types/game';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { usePlayerSync } from '@/hooks/use-player-sync';

const games: { type: GameType; title: string; description: string; icon: React.ReactNode; gradient: string; shadowColor: string }[] = [
  { type: 'choices', title: 'لعبة الاختيارات', description: 'اختر الإجابة الصحيحة من ثلاثة اختيارات', icon: <Gamepad2 className="w-10 h-10" />, gradient: 'from-orange-400 to-amber-500', shadowColor: 'shadow-orange-500/30' },
  { type: 'matching', title: 'لعبة التوصيل', description: 'وصّل الأسئلة بالإجابات الصحيحة', icon: <Link2 className="w-10 h-10" />, gradient: 'from-emerald-400 to-green-500', shadowColor: 'shadow-emerald-500/30' },
  { type: 'true-false', title: 'لعبة صح وغلط', description: 'حدد إذا كانت المعادلة صحيحة أم خاطئة', icon: <CheckCircle2 className="w-10 h-10" />, gradient: 'from-purple-400 to-violet-500', shadowColor: 'shadow-purple-500/30' }
];

const comingSoon = [
  { title: 'الجمع', icon: <Plus className="w-6 h-6" />, gradient: 'from-blue-400 to-cyan-500' },
  { title: 'الطرح', icon: <Minus className="w-6 h-6" />, gradient: 'from-pink-400 to-rose-500' },
  { title: 'القسمة', icon: <Divide className="w-6 h-6" />, gradient: 'from-amber-400 to-yellow-500' }
];

const AVATAR_IMAGES = [
  '/avatars/avatar-1.png', '/avatars/avatar-2.png', '/avatars/avatar-3.png',
  '/avatars/avatar-4.png', '/avatars/avatar-5.png', '/avatars/avatar-6.png',
  '/avatars/avatar-7.png', '/avatars/avatar-8.png', '/avatars/avatar-9.png',
  '/avatars/avatar-10.png', '/avatars/avatar-11.png', '/avatars/avatar-12.png',
  '/avatars/avatar-13.png', '/avatars/avatar-14.png', '/avatars/avatar-15.png',
  '/avatars/avatar-16.png', '/avatars/avatar-17.png', '/avatars/avatar-18.png',
];

const TOTAL_AVATARS = AVATAR_IMAGES.length;

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };
const buttonVariants = { hover: { scale: 1.05, y: -2 }, tap: { scale: 0.95 } };

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { player, dispatch, isLoading } = useGameStore();

  // تزامن البيانات
  usePlayerSync(15000);

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const response = await fetch('/api/player');
        const data = await response.json();
        dispatch({ type: 'SET_PLAYER', payload: data });
      } catch (error) {
        console.error('Failed to load player:', error);
      }
    };
    
    if (isLoading && session?.user) {
      loadPlayer();
    }
  }, [dispatch, isLoading, session]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSelectGame = (gameType: GameType) => {
    router.push(`/select-table?game=${gameType}`);
  };

  const getAvatarImage = (avatarId: number): string => {
    return AVATAR_IMAGES[((avatarId - 1) % TOTAL_AVATARS)];
  };

  if (status === 'loading' || isLoading || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen p-3 sm:p-4 md:p-6">
        {/* Header */}
        <motion.header className="w-full max-w-6xl mx-auto mb-6 md:mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <motion.button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/60 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md ring-2 ring-amber-300/50 shrink-0">
                <Image src={getAvatarImage(player.avatarId)} alt="الصورة الرمزية" fill className="object-cover" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-bold text-gray-800 text-sm leading-tight">{player?.name}</p>
                <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{player?.points} نقطة</span>
                </div>
              </div>
              <User className="w-4 h-4 text-gray-400 hidden sm:block" />
            </motion.button>

            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 shadow-lg" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
                <span className="font-bold text-white text-lg sm:text-xl">{player?.points}</span>
                <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">نقطة</span>
              </motion.div>
              
              <AnimatePresence>
                {player?.isAdmin && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => router.push('/admin')} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" variants={buttonVariants} whileHover="hover" whileTap="tap" title="لوحة التحكم">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
              
              <motion.button onClick={handleSignOut} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/60" variants={buttonVariants} whileHover="hover" whileTap="tap" title="تسجيل الخروج">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Title */}
        <motion.div className="text-center mb-8 md:mb-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <motion.h1 animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity }}>
            <span className="inline-block text-gray-800 text-4xl sm:text-5xl md:text-7xl font-black">جدول</span>
            <span className="inline-block mx-1 sm:mx-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-7xl font-black">الضرب</span>
          </motion.h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium mt-3 sm:mt-4">تعلّم • العب • استمتع</p>
          
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
            {['+', '-', '×', '÷'].map((symbol, i) => (
              <motion.div key={symbol} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/60 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-600" initial={{ opacity: 0, scale: 0, rotate: -180 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }} whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}>
                {symbol}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Games */}
        <motion.div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full" variants={containerVariants} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {games.map((game) => (
              <motion.button
                key={game.type}
                onClick={() => handleSelectGame(game.type)}
                className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md shadow-xl ${game.shadowColor} group p-4 sm:p-6 text-right border-2 border-white/60`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${game.gradient} text-white mb-3 sm:mb-4 shadow-lg`} whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                  {game.icon}
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">{game.title}</h2>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{game.description}</p>
                <motion.div className="mt-3 sm:mt-4 flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium group-hover:text-orange-600 transition-colors" whileHover={{ x: -5 }}>
                  اضغط للعب <span className="text-lg">←</span>
                </motion.div>
              </motion.button>
            ))}
          </div>

          {/* Coming Soon */}
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">قريباً...</p>
            <div className="flex justify-center gap-2 sm:gap-3">
              {comingSoon.map((item, i) => (
                <motion.div key={item.title} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 text-gray-500 text-xs sm:text-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }} whileHover={{ scale: 1.05, y: -2 }}>
                  <div className={`p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} text-white`}>{item.icon}</div>
                  <span className="font-medium hidden sm:inline">{item.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer className="text-center py-3 sm:py-4 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <p className="text-gray-400 text-xs sm:text-sm">صُمّم بحب للأطفال 💛</p>
        </motion.footer>
      </div>
    </div>
  );
}
