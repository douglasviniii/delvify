
import admin from 'firebase-admin';

// Função para inicializar o app Firebase Admin se ainda não estiver inicializado.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  // A abordagem recomendada e mais robusta é usar uma única variável de ambiente
  // contendo o JSON completo da chave de serviço.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.error("ERRO CRÍTICO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.");
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

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
