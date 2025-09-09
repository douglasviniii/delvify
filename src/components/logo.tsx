'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Logo({ logoUrl }: { logoUrl?: string | null }) {
  const finalLogoUrl = logoUrl || "https://picsum.photos/128/32?logo";

  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      <Image src={finalLogoUrl} width={128} height={32} alt="DelviFy Logo" data-ai-hint="logo company" unoptimized />
    </Link>
  );
}
