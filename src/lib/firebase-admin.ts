
import admin from 'firebase-admin';
import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

// Função para inicializar o app Firebase Admin se ainda não estiver inicializado.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountString) {
    throw new Error("ERRO CRÍTICO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.");
  }

  try {
    // Parseia a string JSON.
    const serviceAccount = JSON.parse(serviceAccountString);
    
    // Corrige a formatação da chave privada, substituindo '\\n' por '\n'
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error: any) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK:", error.message);
    throw new Error(`Falha ao inicializar o Firebase Admin SDK: ${error.message}`);
  }
}


// Função para obter a instância do Firestore.
export function getAdminDb() {
  initializeAdminApp();
  return admin.firestore();
}

// Função para obter a instância do Auth.
export function getAdminAuth() {
  initializeAdminApp();
  return admin.auth();
}

// Função para obter a instância do Storage.
export function getAdminStorage() {
  initializeAdminApp();
  return admin.storage();
}

// Helper para serializar Timestamps do Firestore para strings ISO
export const serializeDoc = (doc: DocumentSnapshot<DocumentData>): any => {
      const data = doc.data();
      if (!data) {
          return { id: doc.id };
      }
      const docData: { [key: string]: any } = { id: doc.id, ...data };
      
      for (const key in docData) {
        if (docData[key] instanceof admin.firestore.Timestamp) {
          docData[key] = docData[key].toDate().toISOString();
        } else if (docData[key] && typeof docData[key].toDate === 'function') { // Fallback for client-side Timestamp
          docData[key] = docData[key].toDate().toISOString();
        } else if (Array.isArray(docData[key])) {
          docData[key] = docData[key].map((item: any) => {
              if(item instanceof admin.firestore.Timestamp) {
                  return item.toDate().toISOString();
              } else if (item && typeof item.toDate === 'function') {
                  return item.toDate().toISOString();
              }
              return item;
          });
        }
      }
      return docData;
}
