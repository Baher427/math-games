import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ألوان الصور الرمزية
const avatarColors = [
  'from-red-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-amber-400 to-orange-500',
  'from-yellow-400 to-amber-500',
  'from-lime-400 to-green-500',
  'from-green-400 to-emerald-500',
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-cyan-500',
  'from-cyan-400 to-sky-500',
  'from-sky-400 to-blue-500',
  'from-blue-400 to-indigo-500',
  'from-indigo-400 to-violet-500',
  'from-violet-400 to-purple-500',
  'from-purple-400 to-fuchsia-500',
  'from-fuchsia-400 to-pink-500',
  'from-rose-400 to-red-500',
  'from-red-500 to-orange-500',
  'from-orange-500 to-yellow-500',
  'from-yellow-500 to-green-500',
  'from-green-500 to-teal-500',
  'from-teal-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-red-300 to-rose-500',
  'from-orange-300 to-amber-500',
  'from-amber-300 to-yellow-500',
  'from-yellow-300 to-lime-500',
  'from-lime-300 to-green-500',
  'from-green-300 to-emerald-500',
  'from-emerald-300 to-teal-500',
  'from-teal-300 to-cyan-500',
  'from-cyan-300 to-sky-500',
  'from-sky-300 to-blue-500',
  'from-blue-300 to-indigo-500',
  'from-indigo-300 to-violet-500',
  'from-violet-300 to-purple-500',
  'from-purple-300 to-fuchsia-500',
  'from-fuchsia-300 to-pink-500',
  'from-rose-300 to-red-500',
  'from-red-400 to-orange-400',
  'from-orange-400 to-yellow-400',
  'from-yellow-400 to-green-400',
  'from-green-400 to-blue-400',
  'from-blue-400 to-purple-400',
  'from-purple-400 to-pink-400',
  'from-pink-400 to-red-400',
  'from-gray-400 to-slate-500',
  'from-slate-400 to-zinc-500'
];

async function main() {
  // إنشاء 50 صورة رمزية
  for (let i = 1; i <= 50; i++) {
    await prisma.avatar.create({
      data: {
        id: i,
        name: `صورة ${i}`,
        price: i === 1 ? 0 : 100, // الصورة الأولى مجانية
        isActive: true
      }
    });
  }
  
  console.log('✅ تم إنشاء 50 صورة رمزية');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
