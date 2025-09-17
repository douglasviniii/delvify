
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config({ path: '.env' });

const ADMIN_APP_NAME = 'firebase-admin-app-delvify';

// Lê as credenciais das variáveis de ambiente
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

/**
 * Initializes the Firebase Admin app with a unique name if it doesn't exist.
 * This prevents re-initialization errors in hot-reload environments.
 */
function initializeAdminApp() {
  if (getApps().some((app) => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('As credenciais do Firebase Admin não foram encontradas nas variáveis de ambiente.');
  }

  return initializeApp({
    credential: admin.credential.cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
    }),
    storageBucket: "venda-fcil-pdv.appspot.com",
  }, ADMIN_APP_NAME);
}

const adminApp = initializeAdminApp();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
