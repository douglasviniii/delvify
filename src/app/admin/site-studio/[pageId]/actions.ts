
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { db, serializeDoc } from '@/lib/firebase';
import { getInitialPageData } from '@/lib/initial-page-data';

export async function getPageDataForEditor(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);
        const initialPageData = getInitialPageData();

        if (pageSnap.exists()) {
            const pageData = serializeDoc(pageSnap);
            const defaultData = initialPageData[pageId as keyof typeof initialPageData] || { title: `Página ${pageId}`, sections: [] };
            
            if (pageData && Array.isArray(pageData.sections)) {
                return {
                    title: defaultData.title,
                    sections: pageData.sections,
                };
            }
        }
        
        // Se não existir, retorna os dados iniciais.
        const defaultPageData = initialPageData[pageId as keyof typeof initialPageData];
        if (defaultPageData) {
            return defaultPageData;
        }

        // Se não houver nem dados iniciais, retorna uma estrutura vazia para evitar erros.
        return {
            title: `Página ${pageId}`,
            sections: [],
        };

    } catch (error) {
        console.error("Error fetching page sections:", error);
        throw error;
    }
}


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
