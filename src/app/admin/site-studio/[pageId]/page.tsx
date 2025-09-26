
import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { headers } from 'next/headers';
import { getPageDataForEditor } from "./actions";
import { getInitialPageData } from "@/lib/initial-page-data";

export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');
  const initialPageData = getInitialPageData();

  if (!pageId || !tenantId) {
      notFound();
  }

  try {
    const [posts, pageData] = await Promise.all([
      getAllBlogPosts(tenantId),
      getPageDataForEditor(tenantId, pageId)
    ]);
    
    // Garante que sempre haverá dados para passar, usando o initialPageData como fallback.
    const effectivePageData = pageData || initialPageData[pageId as keyof typeof initialPageData] || { title: `Página ${pageId}`, sections: [] };

    return <SiteEditorClient initialPosts={posts} initialPageData={effectivePageData} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Falha ao carregar os dados iniciais da página ${pageId}:`, error);
    // Em caso de erro na busca de dados, ainda renderizamos o editor com dados padrão
    // para evitar um 404 e permitir que o usuário comece a editar.
    const fallbackPageData = initialPageData[pageId as keyof typeof initialPageData] || { title: `Página ${pageId}`, sections: [] };
    return <SiteEditorClient initialPosts={[]} initialPageData={fallbackPageData} pageId={pageId} tenantId={tenantId} />;
  }
}
