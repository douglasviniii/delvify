
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { useState, useEffect } from 'react';

export function Logo({ logoUrl: initialLogoUrl, tenantId }: { logoUrl?: string | null; tenantId?: string }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

  useEffect(() => {
    // Only fetch if no initial URL is provided and we have a tenant ID
    if (!initialLogoUrl && tenantId) {
      getGlobalSettingsForTenant(tenantId).then(settings => {
        setLogoUrl(settings.logoUrl);
      });
    } else {
      // If an initial URL is provided, use it.
      setLogoUrl(initialLogoUrl);
    }
  }, [tenantId, initialLogoUrl]);


  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      {logoUrl ? (
        <Image src={logoUrl} width={128} height={32} alt="DelviFy Logo" data-ai-hint="logo company" unoptimized />
      ) : (
        <span className="text-xl font-bold tracking-tight">DelviFy</span>
      )}
    </Link>
  );
}
