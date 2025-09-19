
import { getPageDataForEditor } from "./actions";
import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAdminDb } from '@/lib/firebase-admin';

// Esta é uma recriação simplificada do initialPageData, direto no backend.
const createDefaultPageData = (title: string) => ({
    title: `Página de ${title}`,
    sections: [
        {
            id: `${title.toLowerCase().replace(/[\s_]+/g, '-')}-main`,
            name: `Conteúdo Principal de ${title}`,
            component: 'DefaultSection',
            settings: {
                title: `Bem-vindo à Página de ${title}`,
                description: `Este é o conteúdo principal da página de ${title}. Edite esta seção para adicionar as informações relevantes.`,
                backgroundColor: "#FFFFFF",
                titleColor: "#000000",
                descriptionColor: "#6c757d",
            }
        }
    ]
});

const defaultInitialData: Record<string, any> = {
    'privacy-policy': createDefaultPageData("Política de Privacidade"),
    'terms-of-use': createDefaultPageData("Termos de Uso"),
    'cookie-policy': createDefaultPageData("Política de Cookies"),
    'refund-policy': createDefaultPageData("Política de Reembolso"),
    'support-policy': createDefaultPageData("Política de Atendimento"),
    'copyright-policy': createDefaultPageData("Política de Direitos Autorais"),
};


async function getPageDataForEditorLocal(tenantId: string, pageId: string) {
    // Para páginas de políticas, que podem não existir, nós as criamos sob demanda.
    if (defaultInitialData[pageId]) {
        try {
            const adminDb = getAdminDb();
            const pageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
            const pageSnap = await pageRef.get();

            if (pageSnap.exists) {
                const pageData = pageSnap.data();
                 if (pageData && Array.isArray(pageData.sections)) {
                    return {
                        title: defaultInitialData[pageId].title,
                        sections: pageData.sections,
                    };
                }
            }
            // Se a página não existe, cria com os dados padrão e retorna
            await pageRef.set({ sections: defaultInitialData[pageId].sections, createdAt: new Date() });
            return defaultInitialData[pageId];

        } catch(error) {
             console.error("Error fetching/creating default page:", error);
             throw new Error(`Não foi possível carregar ou criar a página '${pageId}'.`);
        }
    }
    
    // Para páginas normais (home, about, etc.), buscamos os dados existentes.
    try {
        const pageData = await getPageDataForEditor(tenantId, pageId);
        if (!pageData || pageData.sections.length === 0) {
            console.warn(`No sections found for page ${pageId}, returning notFound.`);
            notFound();
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
