
import 'dotenv/config';
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountString) {
        throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'venda-fcil-pdv.firebasestorage.app',
    });
  } catch (error: any) {
    console.error('Erro detalhado na inicialização do Firebase Admin:', error);
    throw new Error('Falha na inicialização do Firebase Admin. Verifique a variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON. Erro original: ' + error.message);
  }
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb, adminStorage };
