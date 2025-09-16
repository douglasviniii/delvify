import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
        initializeApp(firebaseAdminConfig);
        console.log("Firebase Admin SDK initialized.");
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        // Em um ambiente de build/serverless, pode já estar inicializado por outro processo
        if (getApps().length === 0) {
            throw error; // Re-throw se a inicialização realmente falhou
        }
    }
  }
  return getApp();
}

export function getAdminDb() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

export function getAdminStorage() {
  initializeFirebaseAdmin();
  return admin.storage();
}

// For backwards compatibility with existing code, we can export these.
// However, the functions above are preferred.
const adminDb = getAdminDb();
const adminAuth = getAdminAuth();
const adminStorage = getAdminStorage();

export { adminDb, adminAuth, adminStorage };
