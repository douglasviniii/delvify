
'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config({ path: '.env' });

const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

const ADMIN_APP_NAME = 'firebase-frameworks';

function initializeFirebaseAdmin(): App {
  const apps = getApps();
  const adminApp = apps.find(app => app.name === ADMIN_APP_NAME);
  
  if (adminApp) {
    return adminApp;
  }
  
  return initializeApp(firebaseAdminConfig, ADMIN_APP_NAME);
}

const adminApp = initializeFirebaseAdmin();

export function getAdminDb() {
  return admin.firestore(adminApp);
}

export function getAdminAuth() {
  return admin.auth(adminApp);
}

export function getAdminStorage() {
  return admin.storage(adminApp);
}

const adminDb = getAdminDb;
const adminAuth = getAdminAuth;
const adminStorage = getAdminStorage;

export { adminDb, adminAuth, adminStorage };
