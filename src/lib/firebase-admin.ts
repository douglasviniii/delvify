import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function getServiceAccount(): ServiceAccount {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('As variáveis de ambiente do Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) devem ser definidas.');
    }

    return {
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
}

let adminApp: App;

if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert(getServiceAccount()),
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