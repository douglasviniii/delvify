import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DelviFy Home">
      <Image src="https://picsum.photos/128/32" width={100} height={32} alt="DelviFy Logo" data-ai-hint="logo company" />
    </Link>
  );
}
