// NextAuth Configuration
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

console.log('🔐 Auth Config Loading...');
console.log('🔐 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Missing ✗');
console.log('🔐 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Missing ✗');
console.log('🔐 DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗');
console.log('🔐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    // تحديث الـ session كل دقيقة للتحقق من الحظر
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 60, // تحديث كل دقيقة
  },
  callbacks: {
    async signIn({ user }) {
      console.log('🔐 SignIn callback triggered');
      console.log('🔐 User email:', user.email);
      
      if (!user.email) {
        console.log('🔐 No email, allowing sign in');
        return true;
      }
      
      try {
        console.log('🔐 Checking for existing player...');
        const existingPlayer = await prisma.player.findUnique({
          where: { email: user.email }
        });
        
        // التحقق من الحظر
        if (existingPlayer?.isBlocked) {
          console.log('🔐 Player is blocked:', existingPlayer.blockedReason);
          // رجع رسالة الحظر مع التوجيه لصفحة الحظر
          const reason = encodeURIComponent(existingPlayer.blockedReason || 'تم حظر حسابك');
          return `/banned?reason=${reason}`;
        }
        
        console.log('🔐 Existing player:', existingPlayer ? `Found: ${existingPlayer.id}` : 'Not found');
        
        if (!existingPlayer) {
          const playerCount = await prisma.player.count();
          console.log('🔐 Player count:', playerCount);
          
          const newPlayer = await prisma.player.create({
            data: {
              email: user.email,
              name: user.name || 'لاعب جديد',
              googleId: user.id,
              image: user.image,
              avatarId: 1,
              points: 0,
              purchasedAvatars: '1',
              isAdmin: playerCount === 0
            }
          });
          console.log('🔐 Created new player:', newPlayer.id);
        }
        
        console.log('🔐 SignIn successful, returning true');
        return true;
      } catch (error) {
        console.error('🔐 SignIn Error Details:', error);
        if (error instanceof Error) {
          return `/auth/error?error=${encodeURIComponent(error.message)}`;
        }
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      console.log('🔐 JWT callback, trigger:', trigger);
      
      // إذا كان هناك مستخدم جديد (تسجيل دخول)
      if (user?.email) {
        try {
          const player = await prisma.player.findUnique({
            where: { email: user.email }
          });
          if (player) {
            token.id = player.id;
            token.isBlocked = player.isBlocked;
            token.blockedReason = player.blockedReason;
            console.log('🔐 JWT: Player ID set from user:', player.id);
          } else {
            console.log('🔐 JWT: Player not found for email:', user.email);
          }
        } catch (error) {
          console.error('🔐 JWT Error:', error);
        }
        return token;
      }
      
      // لو الـ token مش فيه id، نحاول نجيبه من الـ email
      if (!token.id && token.email) {
        try {
          const player = await prisma.player.findUnique({
            where: { email: token.email as string }
          });
          if (player) {
            token.id = player.id;
            token.isBlocked = player.isBlocked;
            token.blockedReason = player.blockedReason;
            console.log('🔐 JWT: Player ID set from token.email:', player.id);
          }
        } catch (error) {
          console.error('🔐 JWT lookup error:', error);
        }
      }
      
      // التحقق من الحظر عند كل تحديث للـ session
      if (token.id) {
        try {
          const player = await prisma.player.findUnique({
            where: { id: token.id as string },
            select: { isBlocked: true, blockedReason: true }
          });
          
          if (player?.isBlocked) {
            token.isBlocked = true;
            token.blockedReason = player.blockedReason;
            console.log('🔐 JWT: Player is blocked!');
          } else {
            token.isBlocked = false;
            token.blockedReason = null;
          }
        } catch (error) {
          console.error('🔐 JWT check error:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback');
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isBlocked = token.isBlocked as boolean;
        session.user.blockedReason = token.blockedReason as string | null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log('🔐 SignIn event:', user.email);
    },
    async signOut({ token }) {
      console.log('🔐 SignOut event:', token?.id);
    },
  },
  pages: {
    signIn: '/landing',
    error: '/banned',
  },
  debug: true,
};
