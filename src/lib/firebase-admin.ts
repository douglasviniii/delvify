
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { serviceAccount } from './firebase-admin-credentials';

function initializeFirebaseAdmin() {
    if (!getApps().length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'venda-fcil-pdv.appspot.com',
            });
            console.log('Firebase Admin SDK inicializado com sucesso.');
        } catch (error: any) {
            console.error('Falha ao inicializar o Firebase Admin SDK:', error.message);
            throw new Error('Não foi possível inicializar o Firebase Admin. Verifique suas credenciais de serviço.');
        }
    }
}

initializeFirebaseAdmin();

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
