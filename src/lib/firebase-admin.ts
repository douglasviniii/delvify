import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// A inicialização do SDK Admin deve ocorrer apenas uma vez.
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "venda-fcil-pdv",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@venda-fcil-pdv.iam.gserviceaccount.com",
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
      }),
      storageBucket: 'venda-fcil-pdv.appspot.com',
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error('Falha na inicialização do Firebase Admin SDK:', error.stack);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
