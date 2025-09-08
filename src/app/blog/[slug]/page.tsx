

import { getPostBySlug } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import Image from 'next/image';
import { Calendar, UserCircle } from 'lucide-react';
import { getGlobalSettingsForTenant } from '@/lib/settings';

// Este é o ID principal do inquilino para o site público.
// Em uma aplicação multi-domínio real, você resolveria isso com base no hostname da requisição.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Sempre busca os posts do inquilino principal para o blog público
  const post = await getPostBySlug(MAIN_TENANT_ID, params.slug);
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  if (!post) {
    notFound();
  }
  
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        <article className="container max-w-4xl py-12 md:py-20">
            <header className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{post.title}</h1>
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
      </main>
      <MainFooter />
    </div>
  );
}
