
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { initialPageData } from '@/lib/page-data';

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
            const initialData = initialPageData[pageId] || { title: "Página Personalizada", sections: [] };
            
            if (pageData && Array.isArray(pageData.sections)) {
                return {
                    title: initialData.title,
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
    
    // Revalidate all relevant paths
    revalidatePath('/'); // Revalidates the home page
    revalidatePath(`/${validatedPageId}`); // Revalidates a potential dynamic page
    revalidatePath(`/admin/site-studio/${validatedPageId}`); // Revalidates the editor page

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
