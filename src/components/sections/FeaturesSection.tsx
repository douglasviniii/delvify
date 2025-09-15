
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Newspaper, Palette as PaletteIcon, ShieldCheck } from 'lucide-react';

export const FeaturesSection = ({ settings }: { settings: any }) => {
    const featureIcons: { [key: string]: React.ReactNode } = {
        Layers: <Layers className="h-8 w-8 text-primary" />,
        Palette: <PaletteIcon className="h-8 w-8 text-primary" />,
        Newspaper: <Newspaper className="h-8 w-8 text-primary" />,
        ShieldCheck: <ShieldCheck className="h-8 w-8 text-primary" />,
    };

    return (
        <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
                {settings.title}
            </h2>
            <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>
                {settings.description}
            </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
