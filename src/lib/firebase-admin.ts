
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { serviceAccount } from './firebase-admin-credentials';

function initializeFirebaseAdmin() {
    if (!getApps().length) {
        try {
            // Reconstruct the service account object with the private key from environment variables
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (!privateKey) {
                throw new Error("A variável de ambiente FIREBASE_PRIVATE_KEY não está definida.");
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    ...serviceAccount,
                    privateKey,
                }),
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
