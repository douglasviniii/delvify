
'use server';

import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { GlobalSettings } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';


// Define o schema para validação dos dados
const SocialLinksSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().or(z.literal('')),
});

const GlobalSettingsSchema = z.object({
  logoUrl: z.string().nullable(),
  primaryColor: z.string(),
  footerInfo: z.object({
    email: z.string().email(),
    phone: z.string(),
    cnpj: z.string(),
    cnpjLink: z.string().url(),
    copyrightText: z.string(),
  }),
  socialLinks: z.object({
    instagram: SocialLinksSchema,
    facebook: SocialLinksSchema,
    linkedin: SocialLinksSchema,
    youtube: SocialLinksSchema,
    whatsapp: SocialLinksSchema,
  }),
  socialsLocation: z.object({
    showInHeader: z.boolean(),
    showInFooter: z.boolean(),
  }),
  pageVisibility: z.record(z.boolean()),
  colors: z.object({
    navbarLinkColor: z.string(),
    navbarLinkHoverColor: z.string(),
    footerLinkColor: z.string(),
    footerLinkHoverColor: z.string(),
  }),
});

const settingsRefAdmin = (tenantId: string) => 
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

  try {
    await settingsRefAdmin(tenantId).set(validation.data, { merge: true });
    
    // Revalida o cache das páginas afetadas para que as mudanças apareçam imediatamente
    revalidatePath('/', 'layout');

    return { success: true, message: 'Configurações salvas com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações globais:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

export async function savePageVisibility(tenantId: string, pageId: string, isVisible: boolean) {
    if (!tenantId) {
        return { success: false, message: 'ID do inquilino é obrigatório.' };
    }
    try {
        await settingsRefAdmin(tenantId).set({
            pageVisibility: {
                [pageId]: isVisible,
            }
        }, { merge: true });
        revalidatePath('/', 'layout');
        return { success: true, message: 'Visibilidade da página atualizada com sucesso.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error(`Erro ao salvar a visibilidade da página ${pageId}:`, error);
        return { success: false, message: `Erro ao salvar: ${errorMessage}` };
    }
}


export async function uploadLogo(tenantId: string, formData: FormData): Promise<{ success: boolean; message: string; url?: string }> {
    if (!tenantId) {
        return { success: false, message: 'ID do inquilino é obrigatório.' };
    }
    
    const file = formData.get('logo') as File;
    if (!file) {
        return { success: false, message: 'Nenhum arquivo de logo encontrado.' };
    }

    try {
        const bucket = adminStorage.bucket();
        const filePath = `tenants/${tenantId}/global/logo_${Date.now()}_${file.name}`;
        const fileUpload = bucket.file(filePath);

        const buffer = Buffer.from(await file.arrayBuffer());

        await fileUpload.save(buffer, {
            metadata: { contentType: file.type },
            public: true, // Torna o arquivo público
        });
        
        const publicUrl = fileUpload.publicUrl();
        
        // Salva a URL diretamente no documento de configurações globais
        await settingsRefAdmin(tenantId).set({ logoUrl: publicUrl }, { merge: true });

        revalidatePath('/', 'layout');

        return { success: true, message: 'Logo carregada com sucesso!', url: publicUrl };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error('Erro no upload da logo via Server Action:', error);
        return { success: false, message: `Erro ao fazer upload: ${errorMessage}` };
    }
}
