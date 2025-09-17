

import { getPostBySlug, getPostComments } from '@/lib/blog-posts';
import type { Post, Comment } from '@/lib/types';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { Calendar, UserCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from './comment-section';
import { submitCommentAction } from './actions';


// Este é o ID do inquilino para o qual os posts estão sendo criados no admin.
const TENANT_ID_WITH_POSTS = process.env.NEXT_PUBLIC_MAIN_TENANT_ID || 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';


export default async function StudentBlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(TENANT_ID_WITH_POSTS, params.slug);
  
  if (!post) {
    notFound();
  }

  const comments = await getPostComments(TENANT_ID_WITH_POSTS, post.id);
  
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="space-y-8">
       <Button asChild variant="outline">
            <Link href="/student/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Blog
            </Link>
        </Button>
      <article className="bg-card p-4 sm:p-8 rounded-lg shadow-sm">
          <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{post.title}</h1>
              <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(post.createdAt)}</span>
              </div>
              </div>
          </header>
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              />
          </div>
          <div
              className="prose dark:prose-invert lg:prose-xl mx-auto"
              dangerouslySetInnerHTML={{ __html: post.content }}
          />
      </article>

      <Separator />

      <CommentSection 
        postId={params.slug}
        tenantId={TENANT_ID_WITH_POSTS}
        initialComments={comments}
      />

    </div>
  );
}
