
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

const formatPrivateKey = (key: string) => {
  return key.replace(/\\n/g, '\n');
};

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const clientId = process.env.FIREBASE_CLIENT_ID;
const clientX509CertUrl = process.env.FIREBASE_CLIENT_X509_CERT_URL;

if (!projectId || !privateKeyId || !privateKey || !clientEmail || !clientId || !clientX509CertUrl) {
    throw new Error("Uma ou mais variáveis de ambiente do Firebase Admin não estão definidas. O Firebase Admin SDK não pode ser inicializado.");
}

const serviceAccount: ServiceAccount = {
  projectId,
  privateKeyId,
  privateKey: formatPrivateKey(privateKey),
  clientEmail,
  clientId,
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl,
  universeDomain: "googleapis.com"
};

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
