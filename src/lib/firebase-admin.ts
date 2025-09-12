
'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env ANTES de qualquer outra execução.
config({ path: '.env' });

// Esta função é a única fonte de verdade para as credenciais da conta de serviço.
const getServiceAccount = () => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountJson) {
        throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não está definida. O backend não pode se autenticar com o Firebase.");
    }
    
    try {
        const decodedString = Buffer.from(serviceAccountJson, 'base64').toString('utf-8');
        const serviceAccount = JSON.parse(decodedString);
        
        // A CORREÇÃO FINAL E DEFINITIVA:
        // O problema é que a `private_key` no JSON tem "\\n" em vez de "\n".
        // Esta linha corrige a formatação da chave antes de usá-la.
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        return serviceAccount;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
        throw new Error(`Falha ao decodificar ou analisar as credenciais da conta de serviço do Firebase. Erro: ${errorMessage}`);
    }
};

// Padrão Singleton para garantir que o Firebase Admin seja inicializado apenas uma vez.
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    try {
        const serviceAccount = getServiceAccount();
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

// Obtém o app inicializado.
const app = getFirebaseAdminApp();

// Inicializa e exporta os serviços.
const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
