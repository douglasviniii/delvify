
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { serviceAccount } from './firebase-admin-credentials';

// Singleton pattern to ensure Firebase Admin is initialized only once.
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    try {
        console.log('Initializing Firebase Admin SDK...');
        const app = initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'venda-fcil-pdv.appspot.com',
        });
        console.log('Firebase Admin SDK initialized successfully.');
        return app;

    } catch (error: any) {
        // This will catch any errors during initialization, including credential parsing.
        console.error('Critical failure initializing Firebase Admin SDK:', error.message);
        // Throw a specific, informative error to stop the application from running in a broken state.
        throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
}

// Get the initialized app.
const app = getFirebaseAdminApp();

// Initialize and export services.
const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
