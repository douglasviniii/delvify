
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function getServiceAccount(): ServiceAccount {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
        throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
    }
    try {
        // A chave de serviço pode estar codificada em Base64
        const decodedString = Buffer.from(serviceAccountString, 'base64').toString('utf-8');
        return JSON.parse(decodedString);
    } catch (e) {
        // Ou pode ser uma string JSON normal
        try {
            return JSON.parse(serviceAccountString);
        } catch (jsonError) {
             throw new Error('Falha ao analisar a chave da conta de serviço. Certifique-se de que é um JSON válido ou uma string codificada em Base64.');
        }
    }
}

const serviceAccount = getServiceAccount();

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb, adminStorage };
