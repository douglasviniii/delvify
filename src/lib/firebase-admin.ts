

import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
    throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida. O Firebase Admin SDK não pode ser inicializado.");
}

let serviceAccount: ServiceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountString);
} catch(e: any) {
    console.error("Falha ao analisar as credenciais da conta de serviço do Firebase. Verifique se a variável de ambiente está corretamente formatada como um JSON de linha única.", e);
    throw new Error(`Formato inválido para as credenciais da conta de serviço do Firebase: ${e.message}`);
}


const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!storageBucket) {
    throw new Error("A variável de ambiente NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET é necessária.");
}

if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: storageBucket,
    });
  } catch (error: any) {
    console.error('Erro detalhado na inicialização do Firebase Admin:', error);
    throw new Error('Falha na inicialização do Firebase Admin. Verifique as credenciais. Erro original: ' + error.message);
  }
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb, adminStorage };
