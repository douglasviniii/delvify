
'use client';

export const DefaultSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>{settings.title}</h2>
            <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>{settings.description}</p>
        </div>
    </section>
  );
