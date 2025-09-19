
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { GlobalSettings } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';


// Define o schema para validação dos dados
const SocialLinksSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().or(z.literal('')),
});

// Remove logoUrl do schema principal para que não seja sobrescrito
const GlobalSettingsSchema = z.object({
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
  getAdminDb().collection('tenants').doc(tenantId).collection('settings').doc('global');



// Ação para salvar as configurações, exceto a logo
export async function saveGlobalSettings(tenantId: string, data: Omit<GlobalSettings, 'logoUrl'>) {
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

    return { success: true, message: 'Configurações gerais salvas com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações globais:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

// Ação dedicada para salvar apenas a URL da logo
export async function saveLogoUrl(tenantId: string, logoUrl: string) {
    if (!tenantId) {
        return { success: false, message: 'ID do inquilino é obrigatório.' };
    }
    const validation = z.string().url('URL da logo inválida.').safeParse(logoUrl);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await settingsRefAdmin(tenantId).set({ logoUrl: validation.data }, { merge: true });
        revalidatePath('/', 'layout');
        return { success: true, message: 'Logo atualizada com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        console.error('Erro ao salvar a URL da logo:', error);
        return { success: false, message: `Erro ao salvar a logo: ${errorMessage}` };
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
