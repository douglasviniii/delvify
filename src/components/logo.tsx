
import Image from 'next/image';
import Link from 'next/link';
import { getGlobalSettingsForTenant } from '@/lib/settings';

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export async function Logo() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
  const logoUrl = settings?.logoUrl || "https://picsum.photos/128/32";

  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      <Image src={logoUrl} width={128} height={32} alt="DelviFy Logo" data-ai-hint="logo company" unoptimized />
    </Link>
  );
}
