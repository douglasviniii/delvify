
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

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

// O TenantProfile agora é a própria definição do documento do inquilino
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
    let profileImageUrl = data.profileImage;

    if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
      const mimeType = profileImageUrl.split(';')[0].split(':')[1];
      const base64Data = profileImageUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      const bucket = adminStorage.bucket();
      // Salva a imagem na pasta do inquilino para isolamento
      const fileName = `tenants/${tenantId}/profile_image.${mimeType.split('/')[1]}`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
        public: true, 
      });
      
      profileImageUrl = file.publicUrl();
    }

    const profileData = {
      ...data,
      profileImage: profileImageUrl,
      updatedAt: new Date(),
    };

    // Salva os dados na coleção 'tenants' usando o tenantId
    const docRef = adminDb.collection('tenants').doc(tenantId);
    await docRef.set(profileData, { merge: true });

    return { success: true, message: 'Perfil salvo com sucesso!', profileImage: profileImageUrl };
  } catch (error) {
    console.error('Error saving tenant profile:', error);
    return { success: false, message: 'Ocorreu um erro ao salvar o perfil.' };
  }
}

// Função para obter dados do perfil do inquilino
export async function getTenantProfile(tenantId: string): Promise<TenantProfile | null> {
  try {
    const docRef = adminDb.collection('tenants').doc(tenantId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as any; 
      if (data.updatedAt) {
          data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return data as TenantProfile;
    } else {
      console.log('No such document for tenantId:', tenantId);
      return null;
    }
  } catch (error) {
    console.error('Error getting tenant profile:', error);
    throw new Error('Failed to fetch tenant profile.');
  }
}
