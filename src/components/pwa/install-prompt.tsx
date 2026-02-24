'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, X, Share, Plus, MonitorSmartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Helper function to detect iOS
function detectIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
         !(window as unknown as { MSStream?: unknown }).MSStream;
}

// Helper function to detect standalone mode
function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

// Helper function to check if dismissed recently
function wasRecentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  const dismissedTime = dismissed ? parseInt(dismissed) : 0;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return dismissedTime > oneWeekAgo;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // استخدام useMemo للحسابات الأولية
  const isStandalone = useMemo(() => detectStandalone(), []);
  const isIOS = useMemo(() => detectIOS(), []);
  const shouldSkipPrompt = useMemo(() => wasRecentlyDismissed(), []);

  useEffect(() => {
    // إذا كان التطبيق مثبت أو رُفض مؤخراً، لا تفعل شيء
    if (isStandalone || shouldSkipPrompt) {
      return;
    }

    // الاستماع لحدث beforeinstallprompt (Android & Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // تأخير عرض الرسالة قليلاً
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // عرض رسالة iOS بعد تأخير
    if (isIOS) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [isStandalone, isIOS, shouldSkipPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // لا تعرض إذا كان التطبيق مثبت
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              {/* أيقونة */}
              <div className="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MonitorSmartphone className="w-7 h-7" />
              </div>
              
              {/* المحتوى */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">ثبّت التطبيق! 📱</h3>
                {isIOS ? (
                  <div className="text-sm text-white/90 space-y-2">
                    <p>لتثبيت التطبيق على جهازك:</p>
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                      <span>اضغط</span>
                      <Share className="w-5 h-5" />
                      <span>ثم</span>
                      <Plus className="w-5 h-5" />
                      <span>«إضافة للشاشة الرئيسية»</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/90">
                    ثبّت التطبيق على جهازك للوصول السريع والعمل بدون إنترنت!
                  </p>
                )}
              </div>
              
              {/* زر الإغلاق */}
              <button
                onClick={handleDismiss}
                className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* زر التثبيت (لغير iOS) */}
            {!isIOS && deferredPrompt && (
              <motion.button
                onClick={handleInstall}
                className="w-full mt-3 bg-white text-orange-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                <span>تثبيت الآن</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
