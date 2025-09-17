
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config({ path: '.env' });

// Nome único para a instância do app de admin para evitar conflitos
const ADMIN_APP_NAME = 'firebase-admin-app-delvify';

// Interface para as credenciais de serviço para tipagem forte
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

// Constrói o objeto de credenciais a partir das variáveis de ambiente
// Isso garante que se alguma variável estiver faltando, a inicialização falhará com um erro claro.
const serviceAccount: ServiceAccount = {
  type: process.env.FIREBASE_TYPE!,
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
  // Substitui a sequência de escape \\n por \n para que a chave seja formatada corretamente
  private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID!,
  auth_uri: process.env.FIREBASE_AUTH_URI!,
  token_uri: process.env.FIREBASE_TOKEN_URI!,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN!,
};

/**
 * Inicializa a aplicação de admin do Firebase de forma segura (singleton).
 * Procura por uma instância nomeada e, se não encontrar, cria uma nova.
 * Isso evita erros de "app já existe" em ambientes de desenvolvimento com hot-reloading.
 */
function initializeFirebaseAdmin(): App {
  const apps = getApps();
  const adminApp = apps.find(app => app.name === ADMIN_APP_NAME);
  
  if (adminApp) {
    return adminApp;
  }
  
  return initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "venda-fcil-pdv.appspot.com",
  }, ADMIN_APP_NAME);
}

// Garante que a instância do app admin seja inicializada.
initializeFirebaseAdmin();

/**
 * Retorna a instância do serviço Firestore do Firebase Admin.
 * Usa a instância nomeada garantindo que a conexão está autenticada.
 */
export function getAdminDb() {
  return getApp(ADMIN_APP_NAME).firestore();
}

/**
 * Retorna a instância do serviço Authentication do Firebase Admin.
 */
export function getAdminAuth() {
  return getApp(ADMIN_APP_NAME).auth();
}

/**
 * Retorna a instância do serviço Storage do Firebase Admin.
 */
export function getAdminStorage() {
  return getApp(ADMIN_APP_NAME).storage();
}
