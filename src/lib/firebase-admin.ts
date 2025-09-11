import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// As variáveis de ambiente do lado do servidor não precisam do prefixo NEXT_PUBLIC_
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
}

// Inicializa o Firebase Admin SDK somente se ainda não foi inicializado
if (!getApps().length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.error('Falha ao inicializar o Firebase Admin SDK:', error);
        throw new Error('Não foi possível inicializar o Firebase Admin. Verifique suas credenciais de serviço.');
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
