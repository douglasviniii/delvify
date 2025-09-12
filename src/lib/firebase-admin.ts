
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { serviceAccount } from './firebase-admin-credentials';

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    try {
        console.log('Inicializando o Firebase Admin SDK...');
        const app = initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'venda-fcil-pdv.appspot.com',
        });
        console.log('Firebase Admin SDK inicializado com sucesso.');
        return app;

    } catch (error: any) {
        console.error('Falha crítica ao inicializar o Firebase Admin SDK:', error.message);
        throw new Error(`Falha ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}

const app = getFirebaseAdminApp();

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
