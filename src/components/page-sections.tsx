

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Layers, Newspaper, Palette as PaletteIcon, ShieldCheck, Search, Star, Rocket, Calendar, UserCircle, Building, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import type { Post } from '@/lib/blog-posts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from 'react';


// Mock Data for Courses
const mockCourses = [
    { id: 1, title: 'Desenvolvimento Web Moderno com React', category: 'DEV', price: 'R$ 499', imageUrl: 'https://picsum.photos/300/200?random=1', rating: 4.8, students: 1250, dataAiHint: "web development" },
    { id: 2, title: 'Marketing Digital para Iniciantes', category: 'MKT', price: 'R$ 299', imageUrl: 'https://picsum.photos/300/200?random=2', rating: 4.5, students: 890, dataAiHint: "digital marketing" },
    { id: 3, title: 'UI/UX Design Essencial', category: 'DESIGN', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=3', rating: 4.9, students: 2100, dataAiHint: "ui ux design" },
    { id: 4, title: 'Gestão de Projetos com Metodologias Ágeis', category: 'GESTÃO', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=4', rating: 4.7, students: 980, dataAiHint: "project management" },
    { id: 5, title: 'Introdução à Inteligência Artificial', category: 'IA', price: 'R$ 699', imageUrl: 'https://picsum.photos/300/200?random=5', rating: 4.9, students: 3500, dataAiHint: "artificial intelligence" },
    { id: 6, title: 'Fotografia Digital para Redes Sociais', category: 'FOTO', price: 'R$ 249', imageUrl: 'https://picsum.photos/300/200?random=6', rating: 4.6, students: 750, dataAiHint: "photography" },
    { id: 7, title: 'Finanças Pessoais e Investimentos', category: 'FINANÇAS', price: 'R$ 349', imageUrl: 'https://picsum.photos/300/200?random=7', rating: 4.8, students: 1800, dataAiHint: "personal finance" },
    { id: 8, title: 'Desenvolvimento de Apps com Flutter', category: 'DEV', price: 'R$ 549', imageUrl: 'https://picsum.photos/300/200?random=8', rating: 4.7, students: 1100, dataAiHint: "mobile development" },
];


// Course Card Component
const CourseCard = ({ course }: { course: any }) => (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader className="p-0">
            <div className="relative aspect-video w-full">
                <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" data-ai-hint={course.dataAiHint} />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary">{course.category}</Badge>
                <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{course.rating}</span>
                </div>
            </div>
            <h3 className="font-headline text-lg font-semibold flex-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{course.students.toLocaleString('pt-BR')} alunos</p>
        </CardContent>
        <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
            <span className="text-xl font-bold text-primary">{course.price}</span>
            <Button size="sm">Ver Curso</Button>
        </CardFooter>
    </Card>
);

// Helper function to format date, can be used by blog sections
const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}


// Centralized Section Components
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

export const DefaultSection = ({ settings }: { settings: any }) => (
    <section className="py-12 md:py-24" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>{settings.title}</h2>
            <p className="mt-4 text-muted-foreground" style={{ color: settings.descriptionColor }}>{settings.description}</p>
        </div>
    </section>
  );

export const CoursesSection = () => (
    <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Explore Nossos Cursos</h2>
                <p className="mt-4 text-muted-foreground">Encontre o curso perfeito para impulsionar sua carreira.</p>
                <div className="mt-6 relative">
                    <Input placeholder="Pesquise por cursos..." className="h-12 text-lg pl-12 pr-4 rounded-full shadow-md" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mockCourses.slice(0, 8).map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
             <div className="mt-12 text-center">
                <Button asChild size="lg">
                    <Link href="/courses">Ver Todos os Cursos</Link>
                </Button>
            </div>
        </div>
    </section>
)

export const LatestPostsSection = ({ posts, settings }: { posts: Post[], settings: any }) => {
    if (!posts || posts.length === 0) {
        return (
            <section className="py-12 md:py-24 bg-secondary/50">
                <div className="container mx-auto px-4 md:px-6">
                     <div className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">{settings.title}</h2>
                        <p className="mt-4 text-muted-foreground">{settings.description}</p>
                    </div>
                    <div className="text-center py-16 border rounded-lg bg-background">
                        <h2 className="text-xl font-semibold">Nenhum post encontrado.</h2>
                        <p className="text-muted-foreground mt-2">Volte em breve para conferir as novidades!</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">{settings.title}</h2>
                    <p className="mt-4 text-muted-foreground">{settings.description}</p>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: posts.length > 3,
                    }}
                    className="w-full max-w-6xl mx-auto"
                >
                    <CarouselContent>
                        {posts.map((post) => (
                            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <div className="p-1 h-full">
                                    <Card className="flex flex-col h-full overflow-hidden">
                                        <CardHeader className="p-0">
                                            <div className="relative aspect-video w-full">
                                                <Image
                                                    src={post.imageUrl}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-1">
                                            <CardTitle className="font-headline text-lg leading-snug mb-2">
                                                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                                    {post.title}
                                                </Link>
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                                        </CardContent>
                                        <CardFooter className="p-4">
                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                <Link href={`/blog/${post.slug}`}>
                                                    Ler mais <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    )
}

export const BlogPageSection = ({ posts, settings }: { posts: Post[], settings: any }) => (
    <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">{settings.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{settings.description}</p>
            </div>

            {posts.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <Card key={post.id} className="flex flex-col">
                        <CardHeader>
                            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                                <Image
                                    src={post.imageUrl}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <CardTitle className="font-headline text-xl leading-snug">
                                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                    {post.title}
                                </Link>
                            </CardTitle>
                            <CardDescription>{post.excerpt}</CardDescription>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4">
                           <div className="flex w-full justify-between items-center text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-4 w-4" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(post.createdAt)}</span>
                                </div>
                           </div>
                           <Button asChild variant="outline" className="w-full">
                                <Link href={`/blog/${post.slug}`}>
                                    Ler mais <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                </div>
            ) : (
              <div className="text-center py-16 border rounded-lg">
                <h2 className="text-2xl font-semibold">Nenhum post encontrado.</h2>
                <p className="text-muted-foreground mt-2">Volte em breve para conferir as novidades!</p>
              </div>
            )}
        </div>
    </section>
);


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

export const FaqPageSection = ({ settings }: { settings: any }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = settings.faqItems.filter((faq: any) => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-12 md:py-20">
      <div className="container max-w-4xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">{settings.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {settings.description}
          </p>
          <div className="mt-8 relative max-w-2xl mx-auto">
            <Input 
              placeholder="O que você está procurando?" 
              className="h-12 text-lg pl-12 pr-4 rounded-full shadow-md border-2 border-transparent focus:border-primary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq: any, index: number) => (
            <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="p-6 text-lg font-semibold text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 text-muted-foreground text-base">
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
              </AccordionContent>
            </AccordionItem>
          )) : (
            <div className="text-center py-16 border rounded-lg">
                <h2 className="text-xl font-semibold">Nenhum resultado encontrado.</h2>
                <p className="text-muted-foreground mt-2">Tente uma busca diferente ou verifique todas as nossas perguntas.</p>
            </div>
          )}
        </Accordion>
      </div>
    </section>
  );
}
