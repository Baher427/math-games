import { BannedPage } from '@/components/auth/banned-page';

// جعل الصفحة ديناميكية لتجنب prerendering
export const dynamic = 'force-dynamic';

export default function BannedRoute() {
  return <BannedPage />;
}
