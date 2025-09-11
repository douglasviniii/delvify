
import { getPageDataForStudio } from "./actions";
import { getAllBlogPosts } from "@/lib/blog-posts";
import type { User } from 'firebase/auth';
import { auth } from "@/lib/firebase"; // Assuming you have a way to get the authenticated user on the server
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';

// This is a placeholder for how you might get the tenant ID.
// In a real app, this would likely come from middleware, session, or decoded token.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;

  // In a real app, you'd get the user from the session on the server.
  // For now, we'll use the placeholder tenant ID.
  const tenantId = MAIN_TENANT_ID; 

  if (!pageId || !tenantId) {
      notFound();
  }

  try {
    const [pageData, posts] = await Promise.all([
      getPageDataForStudio(tenantId, pageId),
      getAllBlogPosts(tenantId)
    ]);

    return <SiteEditorClient initialPageData={pageData} initialPosts={posts} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Failed to load data for page ${pageId}:`, error);
    // You could return a dedicated error component here
    return <div className="flex h-full items-center justify-center"><p>Não foi possível carregar os dados da página.</p></div>;
  }
}
