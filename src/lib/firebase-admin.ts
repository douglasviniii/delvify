
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// This function is the single source of truth for the service account credentials.
const getServiceAccount = () => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountJson) {
        throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não está definida ou está vazia.");
    }
    try {
        const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (e) {
        throw new Error("Falha ao decodificar ou analisar as credenciais da conta de serviço do Firebase. Verifique a variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64.");
    }
};

// Singleton pattern to ensure Firebase Admin is initialized only once.
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    try {
        console.log('Inicializando o Firebase Admin SDK...');
        const app = initializeApp({
            credential: admin.credential.cert(getServiceAccount()),
            storageBucket: 'venda-fcil-pdv.appspot.com',
        });
        console.log('Firebase Admin SDK inicializado com sucesso.');
        return app;

    } catch (error: any) {
        console.error('Falha crítica ao inicializar o Firebase Admin SDK:', error.message);
        throw new Error(`Falha ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}

// Get the initialized app.
const app = getFirebaseAdminApp();

// Initialize and export services.
const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
