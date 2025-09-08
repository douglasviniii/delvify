'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Layers, Newspaper, Palette as PaletteIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Centralized Section Components
const HeroSection = ({ settings }: { settings: any }) => (
    <section className="relative py-20 md:py-32" style={{ backgroundColor: settings.backgroundColor }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 top-0 -z-10 h-1/2 w-full bg-gradient-to-b from-primary/10 to-transparent"
      />
      <div className="container px-4 md:px-6">
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
  
const FeaturesSection = ({ settings }: { settings: any }) => {
    const featureIcons: { [key: string]: React.ReactNode } = {
        Layers: <Layers className="h-8 w-8 text-primary" />,
        Palette: <PaletteIcon className="h-8 w-8 text-primary" />,
        Newspaper: <Newspaper className="h-8 w-8 text-primary" />,
        ShieldCheck: <ShieldCheck className="h-8 w-8 text-primary" />,
    };

    return (
        <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
                {settings.title}
            </h2>
            <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>
                {settings.description}
            </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {settings.features.map((feature: any) => (
                <Card key={feature.title} className="text-center" style={{ backgroundColor: settings.cardColor }}>
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {featureIcons[feature.icon]}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
        </section>
    );
  };
  
const AiCustomizationSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container px-4 md:px-6">
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

const ImageTextSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="container px-4 md:px-6">
        <div className={cn("grid items-center gap-8 md:gap-12 lg:grid-cols-2", { "lg:grid-flow-col-dense": settings.layout === 'right' })}>
           <div className={cn("space-y-4", { "lg:col-start-2": settings.layout === 'right' })}>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
              {settings.title}
            </h2>
            <p className="text-muted-foreground" style={{ color: settings.descriptionColor }}>
              {settings.description}
            </p>
            {settings.buttonText && settings.buttonLink && (
              <Button asChild>
                <Link href={settings.buttonLink}>
                  {settings.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className={cn("relative h-80 w-full overflow-hidden rounded-lg shadow-lg", { "lg:col-start-1 lg:row-start-1": settings.layout === 'right' })}>
            {settings.imageUrl ? (
              <Image
                src={settings.imageUrl}
                alt={settings.title}
                layout="fill"
                objectFit="cover"
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

const DefaultSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>{settings.title}</h2>
            <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>{settings.description}</p>
        </div>
    </section>
  );


export const SectionComponents: { [key: string]: React.FC<any> } = {
    HeroSection,
    FeaturesSection,
    AiCustomizationSection,
    ImageTextSection,
    DefaultSection,
};
