
'use server';

import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { CertificateSettings } from '@/lib/certificates';

// Define o schema para validação dos dados
const CertificateSettingsSchema = z.object({
  companyName: z.string().min(1, "O nome da empresa é obrigatório."),
  companyAddress: z.string().min(1, "O endereço é obrigatório."),
  companyPhone: z.string().min(1, "O telefone é obrigatório."),
  companyEmail: z.string().email("Email inválido."),
  companyWebsite: z.string().url("URL do site inválida."),
  companyCnpj: z.string().min(1, "O CNPJ é obrigatório."),
  additionalInfo: z.string().optional(),
  mainLogoUrl: z.string().nullable(),
  watermarkLogoUrl: z.string().nullable(),
  signatureUrl: z.string().nullable(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida."),
  signatureText: z.string().min(1, "O texto da assinatura é obrigatório."),
});

const settingsRef = (tenantId: string) => 
  adminDb.collection('tenants').doc(tenantId).collection('settings').doc('certificate');

// Função para upload de imagem se for base64
async function uploadImageIfNecessary(tenantId: string, imageKey: keyof CertificateSettings, imageData: string | null): Promise<string | null> {
    if (!imageData || !imageData.startsWith('data:image')) {
        return imageData; // Retorna a URL existente se não for uma nova imagem base64
    }

    try {
        const mimeType = imageData.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        const base64Data = imageData.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const bucket = adminStorage.bucket();
        const fileName = `tenants/${tenantId}/certificate_images/${imageKey}_${Date.now()}.${extension}`;
        const file = bucket.file(fileName);

        await file.save(imageBuffer, {
            metadata: { contentType: mimeType },
            public: true, // Garante que o arquivo seja público
        });
        
        // Retorna a URL pública no formato correto e esperado
        return file.publicUrl();

    } catch(uploadError) {
        console.error(`Erro ao fazer upload da imagem ${imageKey}:`, uploadError);
        throw new Error(`Ocorreu um erro ao fazer upload da imagem: ${imageKey}.`);
    }
}


// Ação para salvar as configurações
export async function saveCertificateSettings(tenantId: string, data: CertificateSettings) {
  if (!tenantId) {
    return { success: false, message: 'ID do inquilino é obrigatório.' };
  }
  
  const validation = CertificateSettingsSchema.safeParse(data);
  if (!validation.success) {
      console.error("Erros de validação:", validation.error.errors);
      return { success: false, message: `Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }

  try {
    const finalData = { ...validation.data };

    // Processa o upload para cada imagem
    finalData.mainLogoUrl = await uploadImageIfNecessary(tenantId, 'mainLogoUrl', finalData.mainLogoUrl);
    finalData.watermarkLogoUrl = await uploadImageIfNecessary(tenantId, 'watermarkLogoUrl', finalData.watermarkLogoUrl);
    finalData.signatureUrl = await uploadImageIfNecessary(tenantId, 'signatureUrl', finalData.signatureUrl);

    await settingsRef(tenantId).set(finalData, { merge: true });
    
    // Revalida o cache das páginas afetadas
    revalidatePath('/admin/certificates/settings');

    return { 
        success: true, 
        message: 'Configurações do certificado salvas com sucesso!', 
        updatedUrls: {
            mainLogoUrl: finalData.mainLogoUrl,
            watermarkLogoUrl: finalData.watermarkLogoUrl,
            signatureUrl: finalData.signatureUrl,
        }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações do certificado:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

// Função para buscar as configurações
export async function getCertificateSettings(tenantId: string): Promise<CertificateSettings | null> {
  if (!tenantId) {
    console.error("ID do inquilino é necessário para buscar as configurações do certificado.");
    return null;
  }
  try {
    const docSnap = await settingsRef(tenantId).get();
    if (docSnap.exists) {
      return docSnap.data() as CertificateSettings;
    }
    return null; // Retorna null se não houver configurações salvas
  } catch (error) {
    console.error('Erro ao buscar as configurações do certificado:', error);
    throw new Error('Não foi possível buscar as configurações do certificado.');
  }
}
