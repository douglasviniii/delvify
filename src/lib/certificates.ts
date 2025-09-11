
'use server';

import { adminDb } from './firebase-admin';

export interface CertificateSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyCnpj: string;
  additionalInfo?: string;
  mainLogoUrl: string | null;
  watermarkLogoUrl: string | null;
  signatureUrl: string | null;
  accentColor: string;
  signatureText: string;
}

const settingsRef = (tenantId: string) => 
  adminDb.collection('tenants').doc(tenantId).collection('settings').doc('certificate');

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
