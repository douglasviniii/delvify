'use server';

import { z } from 'zod';
import { adminStorage } from '@/lib/firebase-admin';

const uploadSchema = z.object({
    file: z.instanceof(File),
    tenantId: z.string(),
    assetType: z.string(),
});

type UploadState = {
    message?: string;
    success: boolean;
    url?: string;
}

export async function uploadCertificateAsset(formData: FormData): Promise<UploadState> {
    const validatedFields = uploadSchema.safeParse({
        file: formData.get('file'),
        tenantId: formData.get('tenantId'),
        assetType: formData.get('assetType'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: `Dados inválidos: ${validatedFields.error.errors.map(e => e.message).join(', ')}`,
        }
    }

    const { file, tenantId, assetType } = validatedFields.data;

    try {
        const imageBuffer = Buffer.from(await file.arrayBuffer());
        const bucket = adminStorage.bucket();
        const fileName = `tenants/${tenantId}/certificate_assets/${assetType}_${Date.now()}_${file.name}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(imageBuffer, {
            metadata: { contentType: file.type },
            public: true,
        });

        // Retorna a URL pública e estável do arquivo
        const publicUrl = fileUpload.publicUrl();

        return { success: true, url: publicUrl, message: 'Upload bem-sucedido!' };

    } catch (error) {
        console.error("Erro no upload do ativo do certificado:", error);
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu no servidor.";
        return { success: false, message: `Falha no upload: ${errorMessage}` };
    }
}
    