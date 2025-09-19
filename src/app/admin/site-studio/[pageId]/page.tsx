
import { getPageDataForEditor } from "./actions";
import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { initialPageData } from "@/lib/initial-page-data";


async function getPageDataForEditorLocal(tenantId: string, pageId: string) {
    // Para páginas de políticas, que podem não existir, nós as criamos sob demanda.
    try {
        let pageData = await getPageDataForEditor(tenantId, pageId);
        
        // Se a página não existir no DB, use os dados iniciais como fallback.
        if (!pageData || pageData.sections.length === 0) {
            const defaultData = initialPageData[pageId as keyof typeof initialPageData];
            if (defaultData) {
                console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
                return defaultData;
            } else {
                 console.warn(`No data in DB or initial data for page ${pageId}.`);
                 // Retorna uma estrutura mínima para evitar que a UI quebre
                 return { title: `Página ${pageId}`, sections: [] };
            }
        }
        return pageData;
    } catch (error) {
        console.error(`Failed to load data for page ${pageId}:`, error);
        notFound();
    }
}


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
      getPageDataForEditorLocal(tenantId, pageId),
      getAllBlogPosts(tenantId)
    ]);

    if (!pageData) {
        notFound();
    }

    return <SiteEditorClient initialPageData={pageData} initialPosts={posts} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Failed to load data for page ${pageId}:`, error);
    return <div className="flex h-full items-center justify-center"><p>Não foi possível carregar os dados da página.</p></div>;
  }
}

