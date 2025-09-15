

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { CertificateSettings } from '@/lib/types';

// Define o schema para validação dos dados
const CertificateSettingsSchema = z.object({
  companyName: z.string().min(1, "O nome da empresa é obrigatório."),
  companyAddress: z.string().min(1, "O endereço é obrigatório."),
  companyPhone: z.string().min(1, "O telefone é obrigatório."),
  companyEmail: z.string().email("Email inválido."),
  companyWebsite: z.string().url("URL do site inválida.").or(z.literal('')),
  companyCnpj: z.string().min(1, "O CNPJ é obrigatório."),
  additionalInfo: z.string().optional(),
  mainLogoUrl: z.string().url("URL da logo principal inválida.").nullable(),
  watermarkLogoUrl: z.string().url("URL da marca d'água inválida.").nullable(),
  signatureUrl: z.string().url("URL da assinatura inválida.").nullable(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida."),
  signatureText: z.string().min(1, "O texto da assinatura é obrigatório."),
});

const settingsRef = (tenantId: string) => 
  adminDb.collection('tenants').doc(tenantId).collection('settings').doc('certificate');


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
    await settingsRef(tenantId).set(validation.data, { merge: true });
    
    revalidatePath('/admin/certificates/settings');

    return { 
        success: true, 
        message: 'Configurações do certificado salvas com sucesso!', 
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
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao buscar as configurações do certificado:', errorMessage);
    throw new Error('Não foi possível buscar as configurações do certificado.');
  }
}
