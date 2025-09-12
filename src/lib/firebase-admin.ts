
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function initializeFirebaseAdmin() {
    if (!getApps().length) {
        try {
            const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

            if (!serviceAccountBase64) {
                throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não está definida.");
            }

            const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(serviceAccountJson);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'venda-fcil-pdv.appspot.com',
            });
            console.log('Firebase Admin SDK inicializado com sucesso.');
        } catch (error: any) {
            console.error('Falha ao inicializar o Firebase Admin SDK:', error.message);
            // Don't throw an error in production, as it might crash the server.
            // Log it and let parts of the app fail gracefully.
        }
    }
}

initializeFirebaseAdmin();

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
