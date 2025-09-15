
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import type { Post } from '@/lib/types';

// Helper function to format date, can be used by blog sections
const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

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
