
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, UserCircle, MessageSquare, ThumbsUp, Share2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';


const TENANT_ID_WITH_POSTS = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Data inválida';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC' 
    });
}


const PostCard = ({ post, userId }: { post: Post; userId?: string }) => {
    const { toast } = useToast();
    const [isLiking, setIsLiking] = useState(false);

    const [optimisticLikes, setOptimisticLikes] = useState({
        likeCount: post.likeCount ?? 0,
        isLiked: post.isLikedByUser ?? false
    });

    useEffect(() => {
        setOptimisticLikes({
            likeCount: post.likeCount ?? 0,
            isLiked: post.isLikedByUser ?? false
        })
    }, [post.likeCount, post.isLikedByUser]);

    const handleLikeClick = async () => {
        if (!userId) {
            toast({ title: "Acesso Negado", description: "Você precisa estar logado para curtir.", variant: "destructive" });
            return;
        }

        if (isLiking) return;

        setIsLiking(true);

        const originalState = optimisticLikes;
        
        // Optimistic update
        setOptimisticLikes(prev => ({
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
            isLiked: !prev.isLiked
        }));

        try {
            const response = await fetch(`/api/blog/posts/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, tenantId: TENANT_ID_WITH_POSTS }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Falha ao curtir o post.");
            }
            // The optimistic state is now confirmed by the server
        } catch (error) {
            console.error("Like action failed:", error);
            // Revert on failure
            setOptimisticLikes(originalState);
            const errorMessage = error instanceof Error ? error.message : "Não foi possível registrar sua curtida.";
            toast({ title: "Erro", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLiking(false);
        }
    }

    const handleShare = () => {
        const url = `${window.location.origin}/student/blog/${post.slug}`;
        navigator.clipboard.writeText(url);
        toast({
            title: 'Link Copiado!',
            description: 'O link para o post foi copiado para sua área de transferência.',
        })
    }
    
    return (
        <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                    <Link href={`/student/blog/${post.slug}`}>
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </Link>
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
                       <button onClick={handleLikeClick} disabled={isLiking} className={`flex items-center gap-1 hover:text-primary transition-colors ${optimisticLikes.isLiked ? 'text-primary' : ''}`}>
                            {isLiking ? <Loader2 className="h-4 w-4 animate-spin"/> : <ThumbsUp className="h-4 w-4" />} 
                            <span className="text-sm">{optimisticLikes.likeCount}</span>
                        </button>
                       <Link href={`/student/blog/${post.slug}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" /> 
                          <span className="text-sm">{post.commentCount ?? 0}</span>
                       </Link>
                   </div>
                   <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /></button>
               </div>
               <Button asChild variant="outline" className="w-full">
                    <Link href={`/student/blog/${post.slug}`}>
                        Ler mais e comentar <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function StudentBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(true);
      getAllBlogPosts(TENANT_ID_WITH_POSTS, user?.uid)
        .then(setPosts)
        .catch(err => console.error("Failed to load blog posts", err))
        .finally(() => setIsLoading(false));
    }
  }, [user, authLoading]);

  if (isLoading || authLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }


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
                <PostCard key={post.id} post={post} userId={user?.uid} />
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

