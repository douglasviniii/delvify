
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket } from 'lucide-react';
import Link from 'next/link';

export const CtaSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24 bg-primary/5 text-center">
        <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
                <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    {settings.title}
                </h2>
                <p className="mt-4 text-muted-foreground">
                    {settings.description}
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href={settings.buttonLink}>
                        {settings.buttonText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </div>
    </section>
);
