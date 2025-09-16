
import { getPageDataForEditor } from "./actions"; // Este não existe, precisaria ser criado. Vamos simular.
import { getAllBlogPosts } from "@/lib/blog-posts";
import type { User } from 'firebase/auth';
import { auth } from "@/lib/firebase"; // Assuming you have a way to get the authenticated user on the server
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialPageData } from '@/lib/page-data';

async function getPageDataForEditor(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return {
                    title: initialPageData[pageId]?.title || "Página Personalizada",
                    sections: pageData.sections,
                };
            }
        }
        
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialPageData[pageId] || { title: "Página não encontrada", sections: [] };
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialPageData[pageId] || { title: "Erro ao carregar", sections: [] };
    }
}


export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;
  const user = await getCurrentUser();
  
  if (!user) {
    // Redireciona para o login se não estiver autenticado
    return notFound(); 
  }
  
  // Para o estúdio, sempre usamos o ID do usuário logado como o ID do inquilino
  const tenantId = user.uid; 

  if (!pageId) {
      notFound();
  }

  try {
    const [pageData, posts] = await Promise.all([
      getPageDataForEditor(tenantId, pageId),
      getAllBlogPosts(tenantId)
    ]);

    if (!pageData || pageData.sections.length === 0) {
        notFound();
    }

    return <SiteEditorClient initialPageData={pageData} initialPosts={posts} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Failed to load data for page ${pageId}:`, error);
    return <div className="flex h-full items-center justify-center"><p>Não foi possível carregar os dados da página.</p></div>;
  }
}
