

'use server';

import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firebase';

interface ResponsiblePerson {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface BankData {
  bank: string;
  agency: string;
  account: string;
  accountType: string;
}

interface TenantProfile {
  companyName: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  stateRegistration: string;
  profileImage: string | null;
  bankData: BankData;
  responsiblePeople: ResponsiblePerson[];
}

// Função para salvar dados do perfil do inquilino
export async function saveTenantProfile(tenantId: string, data: TenantProfile) {
  try {
    const profileData = {
      ...data,
      updatedAt: new Date(),
    };

    const docRef = getAdminDb().collection('tenants').doc(tenantId);
    await docRef.set(profileData, { merge: true });

    return { success: true, message: 'Perfil salvo com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error saving tenant profile:', errorMessage);
    return { success: false, message: `Ocorreu um erro ao salvar o perfil: ${errorMessage}` };
  }
}

// Função para obter dados do perfil do inquilino
export async function getTenantProfile(tenantId: string): Promise<TenantProfile | null> {
  try {
    const docRef = getAdminDb().collection('tenants').doc(tenantId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return serializeDoc(docSnap) as TenantProfile;
    } else {
      console.log('No such document for tenantId:', tenantId);
      return null;
    }
  } catch (error) {
    console.error('Error getting tenant profile:', error);
    return null;
  }
}
