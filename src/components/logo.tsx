
'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Logo({ logoUrl }: { logoUrl?: string | null }) {

  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      {logoUrl ? (
        <Image src={logoUrl} width={128} height={32} alt="Logo" data-ai-hint="company logo" />
      ) : (
        <span className="text-xl font-bold tracking-tight">DelviFy</span>
      )}
    </Link>
  );
}
