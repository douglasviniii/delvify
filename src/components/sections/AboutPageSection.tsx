
'use client';

import Image from 'next/image';
import { Building, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AboutPageSection = ({ settings }: { settings: any }) => (
    <>
        <section className="py-12 md:py-20" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl" style={{ color: settings.titleColor }}>{settings.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground" style={{ color: settings.descriptionColor }}>
                {settings.description}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
            <div className="container px-4 md:px-6">
                <div className={cn("grid md:grid-cols-2 gap-12 items-center", { "lg:grid-flow-col-dense": settings.layout === 'right' })}>
                    <div className={cn("space-y-4", { "lg:col-start-2": settings.layout === 'right' })}>
                        <h2 className="font-headline text-3xl font-bold">{settings.storyTitle}</h2>
                        <p className="text-muted-foreground text-lg">
                           {settings.storyContent}
                        </p>
                    </div>
                     <div className={cn("relative w-full h-80 rounded-lg overflow-hidden shadow-lg", { "lg:col-start-1": settings.layout === 'right' })}>
                        <Image
                            src={settings.imageUrl}
                            alt="Escritório da DelviFy"
                            fill
                            className="object-cover"
                            data-ai-hint="office team"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section className="py-12 md:py-20 bg-secondary/50">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {settings.items.map((item: any, index: number) => (
                        <div key={index} className="space-y-3">
                            {item.icon === 'Target' && <Target className="h-12 w-12 mx-auto text-primary" />}
                            {item.icon === 'Building' && <Building className="h-12 w-12 mx-auto text-primary" />}
                            {item.icon === 'Users' && <Users className="h-12 w-12 mx-auto text-primary" />}
                            <h3 className="font-headline text-2xl font-bold">{item.title}</h3>
                            <p className="text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </>
);
