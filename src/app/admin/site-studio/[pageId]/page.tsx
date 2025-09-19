
import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;
  const user = await getCurrentUser();
  
  if (!user) {
    // Should be redirected by middleware or layout, but as a safeguard
    notFound(); 
  }
  
  const tenantId = user.uid; 

  if (!pageId) {
      notFound();
  }

  // We fetch posts here on the server to pass to the client component,
  // but the main page data will be fetched on the client to avoid hydration errors
  // and provide a better loading experience.
  try {
    const posts = await getAllBlogPosts(tenantId);
    return <SiteEditorClient initialPosts={posts} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Failed to load initial data for page ${pageId}:`, error);
    return <div className="flex h-full items-center justify-center"><p>Não foi possível carregar os dados da página.</p></div>;
  }
}

    