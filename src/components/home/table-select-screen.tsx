'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { useGameStore } from '@/store/game-store';

// الجداول من 2 إلى 9
const tables = [2, 3, 4, 5, 6, 7, 8, 9];

// ألوان متدرجة لكل جدول
const tableColors = [
  {
    gradient: 'from-orange-400 via-amber-400 to-yellow-500',
    shadow: 'shadow-orange-500/40',
    glow: 'bg-orange-400',
    border: 'border-orange-400/30'
  },
  {
    gradient: 'from-emerald-400 via-green-400 to-teal-500',
    shadow: 'shadow-emerald-500/40',
    glow: 'bg-emerald-400',
    border: 'border-emerald-400/30'
  },
  {
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-500',
    shadow: 'shadow-violet-500/40',
    glow: 'bg-violet-400',
    border: 'border-violet-400/30'
  },
  {
    gradient: 'from-pink-400 via-rose-400 to-red-500',
    shadow: 'shadow-pink-500/40',
    glow: 'bg-pink-400',
    border: 'border-pink-400/30'
  },
  {
    gradient: 'from-cyan-400 via-teal-400 to-blue-500',
    shadow: 'shadow-cyan-500/40',
    glow: 'bg-cyan-400',
    border: 'border-cyan-400/30'
  },
  {
    gradient: 'from-yellow-400 via-amber-400 to-orange-500',
    shadow: 'shadow-yellow-500/40',
    glow: 'bg-yellow-400',
    border: 'border-yellow-400/30'
  },
  {
    gradient: 'from-indigo-400 via-blue-400 to-cyan-500',
    shadow: 'shadow-indigo-500/40',
    glow: 'bg-indigo-400',
    border: 'border-indigo-400/30'
  },
  {
    gradient: 'from-rose-400 via-pink-400 to-fuchsia-500',
    shadow: 'shadow-rose-500/40',
    glow: 'bg-rose-400',
    border: 'border-rose-400/30'
  }
];

// معلومات إضافية لكل جدول
const tableInfo = [
  { emoji: '🌟', pattern: 'even' },
  { emoji: '✨', pattern: 'odd' },
  { emoji: '🎯', pattern: 'even' },
  { emoji: '💫', pattern: 'odd' },
  { emoji: '🔮', pattern: 'even' },
  { emoji: '⭐', pattern: 'odd' },
  { emoji: '🎪', pattern: 'even' },
  { emoji: '🎭', pattern: 'odd' }
];

export function TableSelectScreen() {
  const dispatch = useGameStore((state) => state.dispatch);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      rotateY: 90
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* دوائر متحركة */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-pink-500 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500 rounded-full blur-[120px]"
        />
        
        {/* نجوم متلألئة */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-4">
        {/* زر العودة */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-4xl pt-4"
        >
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-5 py-2.5 text-white/90 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 border border-white/10"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
        </motion.div>

        {/* العنوان */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center my-8 md:my-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-amber-400 rounded-full blur-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Sparkles className="relative w-14 h-14 text-amber-400" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
            اختر الجدول
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-md mx-auto">
            اختر الجدول الذي تريد التدرب عليه وابدأ المغامرة!
          </p>
          
          {/* زخرفة */}
          <motion.div 
            className="flex justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              >
                <Star className="w-4 h-4 text-amber-400/60" fill="currentColor" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* شبكة الجداول */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl w-full px-4"
        >
          {tables.map((table, index) => (
            <motion.button
              key={table}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.08, 
                y: -10,
                rotateY: 5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'SELECT_TABLE', payload: table })}
              className="relative group"
            >
              {/* تأثير التوهج خلف البطاقة */}
              <motion.div
                className={`absolute inset-0 ${tableColors[index].glow} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
              />
              
              {/* البطاقة الرئيسية */}
              <div className={`
                relative overflow-hidden aspect-square rounded-3xl 
                bg-gradient-to-br ${tableColors[index].gradient}
                shadow-xl ${tableColors[index].shadow}
                border-2 border-white/20
                transition-all duration-300
                group-hover:border-white/40
              `}>
                {/* زخرفة داخلية */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                
                {/* نمط الزخرفة */}
                <div className="absolute inset-0 opacity-10">
                  {tableInfo[index].pattern === 'even' ? (
                    <div className="w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }} />
                  ) : (
                    <div className="w-full h-full" style={{
                      backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white), linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }} />
                  )}
                </div>

                {/* المحتوى */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                  {/* الإيموجي */}
                  <motion.span 
                    className="text-2xl mb-1"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    {tableInfo[index].emoji}
                  </motion.span>
                  
                  {/* رقم الجدول */}
                  <motion.span 
                    className="text-6xl md:text-7xl font-black drop-shadow-lg"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    {table}
                  </motion.span>
                  
                  {/* نص جدول */}
                  <span className="text-white/80 text-sm font-medium mt-1">جدول</span>
                  
                  {/* زخرفة سفلية */}
                  <motion.div
                    className="flex gap-1 mt-2"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* تأثير اللمعان عند التحويم */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* نصيحة */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 md:mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-white/60 text-sm md:text-base">
              نصيحة: ابدأ بالجداول السهلة ثم انتقل للأصعب!
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto py-4 text-white/30 text-sm flex items-center gap-2">
          <Star className="w-4 h-4" />
          تعلّم بمرح!
          <Star className="w-4 h-4" />
        </footer>
      </div>
    </div>
  );
}
