
'use server';

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function decodes the base64-encoded service account key and initializes Firebase Admin.
// This is a robust way to handle multi-line JSON keys in environment variables.
function initializeFirebaseAdmin() {
    if (getApps().length) {
        return;
    }

    const serviceAccountBase64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
        throw new Error('A variável de ambiente FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 não está definida. Não é possível inicializar o Firebase Admin.');
    }

    try {
        const decodedServiceAccount = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decodedServiceAccount);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "venda-fcil-pdv.appspot.com",
        });
    } catch (error: any) {
        console.error('Falha ao inicializar o Firebase Admin SDK:', error.message);
        throw new Error('Não foi possível inicializar o Firebase Admin. Verifique suas credenciais de serviço.');
    }
}

// Call the initialization function.
initializeFirebaseAdmin();

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
