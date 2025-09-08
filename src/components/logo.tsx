
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { useEffect, useState } from 'react';

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export function Logo() {
  const [logoUrl, setLogoUrl] = useState("https://picsum.photos/128/32?logo");

  useEffect(() => {
    // Como este pode ser usado em páginas de cliente puras (login),
    // buscamos as configurações no lado do cliente.
    // O ideal seria que todos os layouts que usam isso buscassem no servidor e passassem como prop.
    getGlobalSettingsForTenant(MAIN_TENANT_ID).then(settings => {
      if (settings?.logoUrl) {
        setLogoUrl(settings.logoUrl);
      }
    });
  }, []);
  
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      <Image src={logoUrl} width={128} height={32} alt="DelviFy Logo" data-ai-hint="logo company" unoptimized />
    </Link>
  );
}
