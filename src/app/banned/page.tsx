'use client';

import { ShieldX, Mail, MessageCircle, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function BannedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'تم حظر حسابك';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
              <ShieldX className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-black text-center text-white mb-4">تم حظر حسابك</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full mb-6" />

          <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <p className="text-white/90 text-lg leading-relaxed">{decodeURIComponent(reason)}</p>
                <p className="text-white/60 text-sm mt-3">إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع فريق الدعم.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-white/80 font-medium text-center mb-4">تواصل مع الدعم</h3>
            <a href="mailto:support@mathgames.com" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all border border-white/10 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">البريد الإلكتروني</p>
                <p className="text-white/60 text-sm">support@mathgames.com</p>
              </div>
            </a>
            <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all border border-white/10 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">واتساب</p>
                <p className="text-white/60 text-sm">تواصل فورياً</p>
              </div>
            </a>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
            <p className="text-amber-200/80 text-sm">
              <span className="font-bold text-amber-300">ملاحظة:</span> حسابك وجميع بياناتك محفوظة. يمكن استعادة الحساب بعد مراجعة طلبك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
