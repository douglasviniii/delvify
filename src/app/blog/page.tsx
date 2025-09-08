

import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, UserCircle } from 'lucide-react';
import { getGlobalSettingsForTenant } from '@/lib/settings';

// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';


export default async function BlogPage() {
  const posts = await getAllBlogPosts(MAIN_TENANT_ID);
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Nosso Blog</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Fique por dentro das últimas notícias, dicas e insights da nossa equipe.
              </p>
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
      </main>
      <MainFooter />
    </div>
  );
}
