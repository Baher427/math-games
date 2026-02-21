'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// أنيميشن الانتقال بين الصفحات
const pageVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// أنيميشن الأزرار
interface ButtonMotionProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ButtonMotion({ children, onClick, className, disabled }: ButtonMotionProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

// أنيميشن البطاقات
interface CardMotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function CardMotion({ children, className, delay = 0 }: CardMotionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        delay 
      }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}

// أنيميشن الظهور التدريجي
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ children, delay = 0, direction = 'up' }: FadeInProps) {
  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        type: 'tween',
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// أنيميشن النبض
interface PulseMotionProps {
  children: ReactNode;
  className?: string;
}

export function PulseMotion({ children, className }: PulseMotionProps) {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// أنيميشن القفز
interface BounceMotionProps {
  children: ReactNode;
  className?: string;
}

export function BounceMotion({ children, className }: BounceMotionProps) {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// أنيميشن الدوران
interface SpinMotionProps {
  children: ReactNode;
  className?: string;
}

export function SpinMotion({ children, className }: SpinMotionProps) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.div>
  );
}
