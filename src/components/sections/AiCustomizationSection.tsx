
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AiCustomizationSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container mx-auto px-4 md:px-6">
        <div className={cn("grid items-center gap-12 lg:grid-cols-2", { "lg:grid-flow-col-dense": settings.layout === 'right' })}>
            <div className={cn({ "lg:col-start-2": settings.layout === 'right' })}>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
                    {settings.title}
                </h2>
                <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>
                    {settings.description}
                </p>
                {settings.buttonText && settings.buttonLink && (
                  <Button asChild className="mt-6">
                      <Link href={settings.buttonLink}>
                      {settings.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                  </Button>
                )}
            </div>
            <div className={cn("relative h-80 w-full overflow-hidden rounded-lg shadow-lg", { "lg:col-start-1": settings.layout === 'right' })}>
                {settings.imageUrl ? (
                    <Image
                        src={settings.imageUrl}
                        alt="Personalização com IA"
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="abstract technology"
                    />
                 ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <p className="text-muted-foreground">Cole um URL de imagem</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    </section>
  );
