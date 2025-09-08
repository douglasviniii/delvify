import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

let adminApp: App;

if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'venda-fcil-pdv.firebasestorage.app',
    });
  } catch (error: any) {
    console.error('Erro na inicialização do Firebase Admin:', error.message);
    throw new Error('Falha na inicialização do Firebase Admin.');
  }
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb, adminStorage };
