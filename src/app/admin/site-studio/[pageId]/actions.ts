
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

const savePageSchema = z.object({
  pageId: z.string(),
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
    sections: formData.get('sections'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Dados inválidos.',
      success: false,
    };
  }

  const { pageId, sections } = validatedFields.data;

  // This logic is now deprecated as we are not using a dynamic db file for the main page anymore.
  // We can re-enable this when we have dynamic pages.
  if (pageId === 'home') {
     return {
      message: 'A página inicial está sendo gerenciada por dados estáticos e não pode ser salva no momento.',
      success: false,
    };
  }


  try {
    // This logic would need to be adapted for dynamic pages other than 'home'
    const filePath = path.join(process.cwd(), `src/lib/${pageId}-page-db.json`);
    
    // Pretty-print the JSON to make it human-readable
    const sectionsObject = JSON.parse(sections);
    const formattedSections = JSON.stringify(sectionsObject, null, 2);

    await fs.writeFile(filePath, formattedSections, 'utf-8');
    
    revalidatePath('/');
    revalidatePath(`/${pageId}`);
    revalidatePath(`/admin/site-studio/${pageId}`);

    return {
      message: 'Página salva com sucesso!',
      success: true,
    };
  } catch (error) {
    console.error('Erro ao salvar a página:', error);
    return {
      message: 'Ocorreu um erro ao salvar a página.',
      success: false,
    };
  }
}
