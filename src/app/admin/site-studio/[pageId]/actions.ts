
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

  // Only save if it's the home page for now
  if (pageId !== 'home') {
    return {
      message: 'Atualmente, apenas a página inicial pode ser salva.',
      success: false,
    };
  }

  try {
    const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
    
    // Pretty-print the JSON to make it human-readable
    const sectionsObject = JSON.parse(sections);
    const formattedSections = JSON.stringify(sectionsObject, null, 2);

    await fs.writeFile(filePath, formattedSections, 'utf-8');
    
    // Revalidate the home page path to reflect changes immediately
    revalidatePath('/');
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
