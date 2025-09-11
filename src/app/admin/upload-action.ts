'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { z } from 'zod';

const fileSchema = z.object({
  fileBuffer: z.instanceof(Buffer),
  filePath: z.string().min(1, 'O caminho do arquivo é obrigatório.'),
  mimeType: z.string().min(1, 'O tipo do arquivo é obrigatório.'),
});

export async function uploadFile(
  filePath: string,
  mimeType: string,
  fileData: ArrayBuffer
): Promise<{ success: boolean; url?: string; message?: string }> {

  const fileBuffer = Buffer.from(fileData);

  const validation = fileSchema.safeParse({ fileBuffer, filePath, mimeType });

  if (!validation.success) {
    return { success: false, message: 'Dados do arquivo inválidos.' };
  }

  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);

    await file.save(validation.data.fileBuffer, {
      metadata: { contentType: validation.data.mimeType },
      public: true,
    });

    const publicUrl = file.publicUrl();

    return { success: true, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error(`Erro no upload para ${filePath}:`, error);
    return { success: false, message: `Erro no upload: ${errorMessage}` };
  }
}
