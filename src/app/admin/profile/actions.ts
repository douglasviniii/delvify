
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin SDK
const firebaseConfig = {
  credential: credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp(firebaseConfig);
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

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

// Function to save tenant profile data
export async function saveTenantProfile(tenantId: string, data: TenantProfile) {
  try {
    let profileImageUrl = data.profileImage;

    // Check if the profile image is a base64 string
    if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
      const mimeType = profileImageUrl.split(';')[0].split(':')[1];
      const base64Data = profileImageUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      const bucket = storage.bucket();
      const fileName = `profile_images/${tenantId}.${mimeType.split('/')[1]}`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
        public: true, // Make the file publicly readable
      });
      
      // Get the public URL
      profileImageUrl = file.publicUrl();
    }

    const profileData = {
      ...data,
      profileImage: profileImageUrl, // Save the URL instead of the base64 string
      updatedAt: new Date(),
    };

    const docRef = db.collection('tenants').doc(tenantId);
    await docRef.set(profileData, { merge: true });

    return { success: true, message: 'Perfil salvo com sucesso!', profileImage: profileImageUrl };
  } catch (error) {
    console.error('Error saving tenant profile:', error);
    return { success: false, message: 'Ocorreu um erro ao salvar o perfil.' };
  }
}

// Function to get tenant profile data
export async function getTenantProfile(tenantId: string): Promise<TenantProfile | null> {
  try {
    const docRef = db.collection('tenants').doc(tenantId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Convert Firestore Timestamp to Date if necessary, then to JSON-compatible format
      const data = docSnap.data() as any; // Use any to handle Timestamps
      if (data.updatedAt) {
          data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return data as TenantProfile;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting tenant profile:', error);
    throw new Error('Failed to fetch tenant profile.');
  }
}
