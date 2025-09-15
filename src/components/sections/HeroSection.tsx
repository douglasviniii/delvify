
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const HeroSection = ({ settings }: { settings: any }) => (
    <section className="relative py-20 md:py-32" style={{ backgroundColor: settings.backgroundColor }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 top-0 -z-10 h-1/2 w-full bg-gradient-to-b from-primary/10 to-transparent"
      />
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl" style={{ color: settings.titleColor }}>
            {settings.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl" style={{ color: settings.descriptionColor }}>
            {settings.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {settings.button1Text && settings.button1Link && (
              <Button asChild size="lg">
                <Link href={settings.button1Link}>
                  {settings.button1Text} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            {settings.button2Text && settings.button2Link && (
              <Button asChild size="lg" variant="outline">
                <Link href={settings.button2Link}>{settings.button2Text}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
