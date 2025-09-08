import { Logo } from '@/components/logo';

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <Logo />
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {currentYear} DelviFy, Inc. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
