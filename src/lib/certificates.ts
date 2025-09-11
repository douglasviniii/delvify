
'use server';

import { adminDb } from './firebase-admin';
import type { CertificateSettings } from './types';

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
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao buscar as configurações do certificado:', errorMessage);
    throw new Error('Não foi possível buscar as configurações do certificado.');
  }
}
