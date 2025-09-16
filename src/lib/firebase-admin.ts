
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config({ path: '.env' });

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_STORAGE_BUCKET,
} = process.env;

// Validação para garantir que as variáveis de ambiente estão carregadas.
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_STORAGE_BUCKET) {
    console.error("Firebase Admin credentials not found in environment variables.");
    // Em um ambiente de produção, você pode querer lançar um erro para interromper a inicialização.
    // throw new Error("Firebase Admin credentials not found in environment variables.");
}

const firebaseAdminConfig = {
  // O 'satisfies' garante que o objeto corresponda ao tipo esperado, mesmo com a verificação acima.
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  } as admin.ServiceAccount),
  storageBucket: FIREBASE_STORAGE_BUCKET,
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
        // Só inicializa se as credenciais essenciais estiverem presentes.
        if (FIREBASE_PROJECT_ID) {
           initializeApp(firebaseAdminConfig);
           console.log("Firebase Admin SDK initialized successfully.");
        } else {
            console.warn("Skipping Firebase Admin initialization, required credentials missing.");
        }
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        // Em um ambiente de build/serverless, pode já estar inicializado por outro processo.
        // Se ainda não houver apps, o erro é genuíno.
        if (getApps().length === 0) {
            throw error;
        }
    }
  }
  return getApp();
}

// Funções de exportação para obter instâncias dos serviços do admin
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

// Para compatibilidade com o código existente, podemos manter essas exportações.
// No entanto, o uso das funções acima é preferível.
const adminDb = getAdminDb;
const adminAuth = getAdminAuth;
const adminStorage = getAdminStorage;

export { adminDb, adminAuth, adminStorage };
