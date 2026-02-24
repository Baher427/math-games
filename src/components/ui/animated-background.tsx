'use client';

import { motion } from 'framer-motion';

// أشكال متحركة للخلفية
const floatingShapes = [
  { size: 60, x: '10%', y: '20%', color: 'from-orange-300/30 to-amber-400/30', delay: 0, duration: 6 },
  { size: 80, x: '85%', y: '15%', color: 'from-pink-300/30 to-rose-400/30', delay: 1, duration: 7 },
  { size: 50, x: '70%', y: '70%', color: 'from-purple-300/30 to-violet-400/30', delay: 2, duration: 5 },
  { size: 70, x: '20%', y: '80%', color: 'from-blue-300/30 to-cyan-400/30', delay: 0.5, duration: 8 },
  { size: 45, x: '50%', y: '10%', color: 'from-green-300/30 to-emerald-400/30', delay: 1.5, duration: 6 },
  { size: 55, x: '90%', y: '50%', color: 'from-yellow-300/30 to-orange-400/30', delay: 2.5, duration: 7 },
  { size: 65, x: '5%', y: '50%', color: 'from-teal-300/30 to-cyan-400/30', delay: 0.8, duration: 5.5 },
  { size: 40, x: '40%', y: '90%', color: 'from-rose-300/30 to-pink-400/30', delay: 1.8, duration: 6.5 },
];

// رموز رياضية
const mathSymbols = ['+', '-', '×', '÷', '=', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* الخلفية الأساسية */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />
      
      {/* تدرج إضافي */}
      <div className="absolute inset-0 bg-gradient-to-tl from-rose-50/50 via-transparent to-purple-50/30" />
      
      {/* أشكال عائمة */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-xl`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}
      
      {/* رموز رياضية شفافة */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`symbol-${i}`}
            className="absolute text-4xl font-bold text-orange-200/40 select-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [-5, 5, -5],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            {mathSymbols[i % mathSymbols.length]}
          </motion.div>
        ))}
      </div>
      
      {/* نجوم صغيرة متلألئة */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// خلفية مخصصة للألعاب
export function GameBackground({ variant = 'purple' }: { variant?: 'purple' | 'green' | 'orange' }) {
  const gradients = {
    purple: 'from-purple-100 via-violet-50 to-fuchsia-100',
    green: 'from-green-100 via-emerald-50 to-teal-100',
    orange: 'from-orange-100 via-amber-50 to-yellow-100',
  };

  const shapes = {
    purple: 'from-purple-300/20 to-violet-400/20',
    green: 'from-green-300/20 to-emerald-400/20',
    orange: 'from-orange-300/20 to-amber-400/20',
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[variant]}`} />
      
      {/* دوائر متحركة */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${shapes[variant]} blur-2xl`}
          style={{
            width: 100 + i * 30,
            height: 100 + i * 30,
            left: `${15 + i * 18}%`,
            top: `${10 + i * 15}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
