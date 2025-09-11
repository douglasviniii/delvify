
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Em ambientes do Firebase (como App Hosting, Cloud Functions),
// o SDK Admin pode ser inicializado sem credenciais explícitas.
// Ele detectará automaticamente as credenciais do ambiente de serviço.
if (!getApps().length) {
    admin.initializeApp({
        storageBucket: "venda-fcil-pdv.firebasestorage.app",
    });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
