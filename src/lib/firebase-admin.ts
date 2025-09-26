import admin from 'firebase-admin';

// Função para inicializar o app Firebase Admin se ainda não estiver inicializado.
// Isso é para garantir que a inicialização ocorra apenas uma vez.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  // Monta o objeto de credenciais a partir das variáveis de ambiente.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // A chave privada precisa ter suas quebras de linha (escapadas como \\n) convertidas para \n.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    // Inicializa o SDK do Firebase Admin usando o método de credencial de certificado.
    // Esta é a forma mais robusta de garantir que a chave privada seja analisada corretamente.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
     console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error: any) {
    // Loga um erro crítico se a inicialização falhar.
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
