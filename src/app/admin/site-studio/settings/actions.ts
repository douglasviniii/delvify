
'use server';

import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define o schema para validação dos dados
const SocialLinksSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().or(z.literal('')),
});

const GlobalSettingsSchema = z.object({
  logoUrl: z.string().url().nullable(),
  primaryColor: z.string(),
  footerInfo: z.object({
    email: z.string().email(),
    phone: z.string(),
    cnpj: z.string(),
    cnpjLink: z.string().url(),
  }),
  socialLinks: z.object({
    instagram: SocialLinksSchema,
    facebook: SocialLinksSchema,
    linkedin: SocialLinksSchema,
    youtube: SocialLinksSchema,
    whatsapp: SocialLinksSchema,
  }),
  socialsLocation: z.string(),
});

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

const settingsRef = (tenantId: string) => 
  adminDb.collection('tenants').doc(tenantId).collection('settings').doc('global');

// Ação para salvar as configurações
export async function saveGlobalSettings(tenantId: string, data: GlobalSettings) {
  if (!tenantId) {
    return { success: false, message: 'ID do inquilino é obrigatório.' };
  }
  
  const validation = GlobalSettingsSchema.safeParse(data);
  if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);
      return { success: false, message: `Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }

  let finalData = { ...validation.data };

  // Lógica para upload de imagem se for base64
  if (finalData.logoUrl && finalData.logoUrl.startsWith('data:image')) {
    try {
        const mimeType = finalData.logoUrl.split(';')[0].split(':')[1];
        const base64Data = finalData.logoUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const bucket = adminStorage.bucket();
        const fileName = `tenants/${tenantId}/global/logo.${mimeType.split('/')[1]}`;
        const file = bucket.file(fileName);

        await file.save(imageBuffer, {
            metadata: { contentType: mimeType },
            public: true, 
        });
        
        finalData.logoUrl = file.publicUrl();
    } catch(uploadError) {
        console.error('Erro ao fazer upload da logo:', uploadError);
        return { success: false, message: 'Ocorreu um erro ao fazer upload da nova logo.' };
    }
  }


  try {
    await settingsRef(tenantId).set(finalData, { merge: true });
    
    // Revalida o cache das páginas afetadas para que as mudanças apareçam imediatamente
    revalidatePath('/', 'layout');

    return { success: true, message: 'Configurações salvas com sucesso!', newLogoUrl: finalData.logoUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações globais:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

// Função para buscar as configurações
export async function getGlobalSettings(tenantId: string): Promise<GlobalSettings | null> {
  if (!tenantId) {
    console.error("ID do inquilino é necessário para buscar as configurações.");
    return null;
  }
  try {
    const docSnap = await settingsRef(tenantId).get();
    if (docSnap.exists) {
      return docSnap.data() as GlobalSettings;
    }
    return null; // Retorna null se não houver configurações salvas
  } catch (error) {
    console.error('Erro ao buscar as configurações globais:', error);
    throw new Error('Não foi possível buscar as configurações do site.');
  }
}
