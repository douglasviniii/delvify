
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { GlobalSettings } from '@/lib/settings';

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

  try {
    await settingsRef(tenantId).set(validation.data, { merge: true });
    
    // Revalida o cache das páginas afetadas para que as mudanças apareçam imediatamente
    revalidatePath('/', 'layout');

    return { success: true, message: 'Configurações salvas com sucesso!' };
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


export async function savePageVisibility(tenantId: string, pageId: string, isVisible: boolean) {
    if (!tenantId) {
        return { success: false, message: 'ID do inquilino é obrigatório.' };
    }
    try {
        await settingsRef(tenantId).set({
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
