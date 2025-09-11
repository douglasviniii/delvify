'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { z } from 'zod';

const fileSchema = z.object({
  fileBuffer: z.instanceof(Buffer),
  filePath: z.string().min(1, 'O caminho do arquivo é obrigatório.'),
  mimeType: z.string().min(1, 'O tipo do arquivo é obrigatório.'),
});

// Ação de servidor dedicada para fazer upload de arquivos de certificado.
// Isso move a lógica de upload para o servidor, contornando problemas de permissão do cliente.
export async function uploadCertificateAsset(
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

    // Salva o arquivo no bucket
    await file.save(validation.data.fileBuffer, {
      metadata: { contentType: validation.data.mimeType },
      // Torna o arquivo público para que possa ser acessado por uma URL
      public: true,
    });

    // Retorna a URL pública do arquivo
    const publicUrl = file.publicUrl();
    
    return { success: true, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error(`Erro no upload para ${filePath}:`, error);
    return { success: false, message: `Erro no upload: ${errorMessage}` };
  }
}
