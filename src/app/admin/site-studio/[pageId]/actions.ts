
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';

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


const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  component: z.string(),
  settings: z.record(z.any()),
});

const savePageSchema = z.object({
  pageId: z.string(),
  tenantId: z.string(),
  sections: z.array(sectionSchema),
});

export type SavePageState = {
  message: string;
  success: boolean;
};

export async function getPageDataForEditor(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            const defaultData = defaultInitialData[pageId] || { title: `Página ${pageId}`, sections: [] };
            
            if (pageData && Array.isArray(pageData.sections)) {
                return {
                    title: defaultData.title,
                    sections: pageData.sections,
                };
            }
        }
        
        // Se a página não existe no DB, cria a partir dos padrões e retorna.
        const defaultDataForPage = defaultInitialData[pageId];
        if (defaultDataForPage) {
            console.log(`No page data found for ${tenantId}/${pageId}, creating and returning initial data.`);
            const adminDb = getAdminDb();
            const adminPageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
            await adminPageRef.set({ sections: defaultDataForPage.sections, createdAt: new Date() });
            return defaultDataForPage;
        }

        // Se não for uma página padrão, retorna um erro para indicar que não foi encontrada.
        console.error(`No default data setup for pageId: ${pageId}`);
        throw new Error(`Página '${pageId}' não é uma página padrão configurada.`);

    } catch (error) {
        console.error("Error fetching or creating page sections:", error);
        throw error; // Lança o erro para ser pego pelo catch do componente de página
    }
}


export async function savePage(
  tenantId: string,
  pageId: string,
  sections: any[]
): Promise<SavePageState> {
  const validatedFields = savePageSchema.safeParse({
    pageId,
    tenantId,
    sections,
  });

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.errors);
    return {
      message: 'Dados inválidos.',
      success: false,
    };
  }

  const { pageId: validatedPageId, tenantId: validatedTenantId, sections: validatedSections } = validatedFields.data;

  if (!validatedTenantId) {
    return {
      message: 'ID do inquilino não encontrado. Você precisa estar logado.',
      success: false
    }
  }

  try {
    const pageRef = getAdminDb().collection('tenants').doc(validatedTenantId).collection('pages').doc(validatedPageId);
    
    await pageRef.set({
        sections: validatedSections,
        updatedAt: new Date(),
    }, { merge: true });
    
    revalidatePath('/');
    revalidatePath(`/${validatedPageId}`);
    revalidatePath(`/admin/site-studio/${validatedPageId}`); 

    return {
      message: 'Página salva com sucesso!',
      success: true,
    };
  } catch (error) {
    console.error('Erro ao salvar a página:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    return {
      message: `Ocorreu um erro ao salvar a página: ${errorMessage}`,
      success: false,
    };
  }
}
