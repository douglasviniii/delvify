
import admin from 'firebase-admin';
import { config } from 'dotenv';

config({ path: '.env' });

// Hardcoded service account details as provided.
const serviceAccount = {
  "type": "service_account",
  "project_id": "venda-fcil-pdv",
  "private_key_id": "a39e60e136c69c8f19fb694a989ef0a4a2af5ddf",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@venda-fcil-pdv.iam.gserviceaccount.com",
  "client_id": "100681931275435978010",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40venda-fcil-pdv.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
      storageBucket: "venda-fcil-pdv.appspot.com",
    });
  }
}

// Function to get the Firestore instance.
export function getAdminDb() {
  initializeAdminApp();
  return admin.firestore();
}

// Function to get the Auth instance.
export function getAdminAuth() {
  initializeAdminApp();
  return admin.auth();
}

// Function to get the Storage instance.
export function getAdminStorage() {
  initializeAdminApp();
  return admin.storage();
}

// Helper to serialize Firestore Timestamps
export const serializeDoc = (doc: admin.firestore.DocumentSnapshot): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    for (const key in docData) {
      if (docData[key] instanceof admin.firestore.Timestamp) {
        docData[key] = docData[key].toDate().toISOString();
      }
    }
    return docData;
}
