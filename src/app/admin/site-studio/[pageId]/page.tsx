
import { getPageDataForEditor } from "./actions";
import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;
  const user = await getCurrentUser();
  
  if (!user) {
    notFound(); 
  }
  
  const tenantId = user.uid; 

  if (!pageId) {
      notFound();
  }

  try {
    const [pageData, posts] = await Promise.all([
      getPageDataForEditor(tenantId, pageId),
      getAllBlogPosts(tenantId)
    ]);

    // getPageDataForEditor agora retorna dados padrão se a página não existir,
    // então a verificação de seções vazias não é mais necessária para causar um 404.
    if (!pageData) {
        notFound();
    }

    return <SiteEditorClient initialPageData={pageData} initialPosts={posts} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Failed to load data for page ${pageId}:`, error);
    return <div className="flex h-full items-center justify-center"><p>Não foi possível carregar os dados da página.</p></div>;
  }
}
