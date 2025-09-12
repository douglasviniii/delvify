
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';
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
    const pageRef = adminDb.collection('tenants').doc(validatedTenantId).collection('pages').doc(validatedPageId);
    
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

export async function getPageDataForStudio(tenantId: string, pageId: string) {
    if (!tenantId) {
        throw new Error("Tenant ID is required.");
    }
    
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const data = pageSnap.data();
            if (data && data.sections) {
                 return {
                    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
                    sections: data.sections,
                };
            }
        }
        
        // Fallback to specific initial data for the given pageId
        if (initialPageData[pageId]) {
             console.log(`No data found for page ${pageId} in tenant ${tenantId}. Returning initial data.`);
             return initialPageData[pageId];
        }

        // If pageId is not in our initial data map, return a very generic default
        console.warn(`No specific initial data for pageId: ${pageId}. Returning generic default.`);
        return {
            title: `Página ${pageId}`,
            sections: [{
                id: 'default-section',
                name: 'Seção Padrão',
                component: 'DefaultSection',
                settings: {
                    title: `Bem-vindo à página ${pageId}`,
                    description: 'Edite esta página para adicionar seu conteúdo.'
                }
            }]
        };

    } catch (error) {
        console.error(`Failed to fetch page data for ${tenantId}/${pageId}:`, error);
        throw new Error("Could not fetch page data.");
    }
}
