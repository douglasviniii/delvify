
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts, type Post } from '@/lib/blog-posts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, UserCircle, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Este é o ID do inquilino para o qual os posts estão sendo criados no admin.
const TENANT_ID_WITH_POSTS = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}


export default async function StudentBlogPage() {
  const posts = await getAllBlogPosts(TENANT_ID_WITH_POSTS);

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Blog da Comunidade</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Fique por dentro das últimas notícias, dicas e artigos da nossa equipe e interaja com a comunidade.
            </p>
        </div>

        {posts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
                <Card key={post.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
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
                            <Link href={`/student/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                {post.title}
                            </Link>
                        </CardTitle>
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
                        <CardDescription className='line-clamp-3'>{post.excerpt}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                       <div className="w-full flex justify-between items-center text-muted-foreground">
                           <div className="flex items-center gap-4">
                               <button className="flex items-center gap-1 hover:text-primary transition-colors"><ThumbsUp className="h-4 w-4" /> <span className="text-sm">0</span></button>
                               <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageSquare className="h-4 w-4" /> <span className="text-sm">0</span></button>
                           </div>
                           <button className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /></button>
                       </div>
                       <Button asChild variant="outline" className="w-full">
                            <Link href={`/student/blog/${post.slug}`}>
                                Ler mais e comentar <ArrowRight className="ml-2 h-4 w-4" />
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
  );
}
