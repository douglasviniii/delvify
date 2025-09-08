
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase';
import { initialHomePageData } from '@/lib/page-data';

const savePageSchema = z.object({
  pageId: z.string(),
  tenantId: z.string(),
  sections: z.string(), // JSON string of sections array
});

export type SavePageState = {
  message: string;
  success: boolean;
};

export async function savePage(
  prevState: SavePageState,
  formData: FormData
): Promise<SavePageState> {
  const validatedFields = savePageSchema.safeParse({
    pageId: formData.get('pageId'),
    tenantId: formData.get('tenantId'),
    sections: formData.get('sections'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Dados inválidos.',
      success: false,
    };
  }

  const { pageId, tenantId, sections } = validatedFields.data;

  if (!tenantId) {
    return {
      message: 'ID do inquilino não encontrado. Você precisa estar logado.',
      success: false
    }
  }


  try {
    const pageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
    
    const sectionsObject = JSON.parse(sections);

    await pageRef.set({
        sections: sectionsObject,
        updatedAt: new Date(),
    }, { merge: true });
    
    // Revalidate all relevant paths
    revalidatePath('/'); // Revalidates the home page
    revalidatePath(`/${pageId}`); // Revalidates a potential dynamic page
    revalidatePath(`/admin/site-studio/${pageId}`); // Revalidates the editor page

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
        const pageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
        const pageSnap = await pageRef.get();

        if (pageSnap.exists) {
            const data = pageSnap.data();
            if (data && data.sections) {
                 return {
                    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
                    sections: data.sections,
                };
            }
        }
        
        // If no document or no sections, return initial data
        console.log(`No data found for page ${pageId} in tenant ${tenantId}. Returning initial data.`);
        return {
            title: 'Página Inicial (Padrão)',
            sections: initialHomePageData.sections,
        };

    } catch (error) {
        console.error(`Failed to fetch page data for ${tenantId}/${pageId}:`, error);
        throw new Error("Could not fetch page data.");
    }
}
