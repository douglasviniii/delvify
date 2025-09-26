
import admin from 'firebase-admin';
import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

// Função para inicializar o app Firebase Admin se ainda não estiver inicializado.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountString) {
    console.error("ERRO CRÍTICO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.");
    return;
  }

  try {
    // Em ambientes como Vercel/Render, as quebras de linha na private_key podem vir como '\\n' literal.
    // Esta linha substitui essas sequências de escape pela quebra de linha real que o JSON parser espera.
    const fixedServiceAccountString = serviceAccountString.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(fixedServiceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error: any) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK:", error.message);
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
        } else if (Array.isArray(docData[key])) {
          docData[key] = docData[key].map((item: any) => {
              if(item instanceof admin.firestore.Timestamp) {
                  return item.toDate().toISOString();
              }
              return item;
          });
        }
      }
      return docData;
}
