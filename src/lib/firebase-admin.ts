
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config({ path: '.env' });

// Constrói o objeto de configuração a partir das variáveis de ambiente
const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // A chave privada é lida da variável de ambiente, que lida corretamente com as novas linhas
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    // Verifica se as credenciais essenciais estão presentes antes de tentar inicializar
    if (!firebaseAdminConfig.credential.projectId || !firebaseAdminConfig.credential.clientEmail || !firebaseAdminConfig.credential.privateKey) {
        console.error("Firebase Admin initialization error: Missing environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your .env file.");
        // Lançar um erro aqui impede que o app continue com uma configuração quebrada
        throw new Error("Missing Firebase Admin credentials in environment variables.");
    }
      
    try {
      initializeApp(firebaseAdminConfig);
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error.message);
      // Se a inicialização falhar, não queremos que o app continue silenciosamente.
      if (getApps().length === 0) {
        throw error;
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

const adminDb = getAdminDb;
const adminAuth = getAdminAuth;
const adminStorage = getAdminStorage;

export { adminDb, adminAuth, adminStorage };
