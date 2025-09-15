
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { serviceAccount } from './firebase-admin-credentials';

// Garante que a inicialização ocorra apenas uma vez.
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'venda-fcil-pdv.appspot.com',
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error('Falha na inicialização do Firebase Admin SDK:', error);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
