'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

  try {
    // In a real app, you would save this to a database.
    // For now, we'll just log it to the console.
    console.log(`Salvando página: ${validatedFields.data.pageId}`);
    console.log('Dados das seções:', JSON.parse(validatedFields.data.sections));
    
    // Revalidate the path to show the changes would be reflected if fetched from a DB
    revalidatePath(`/admin/site-studio/${validatedFields.data.pageId}`);

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
