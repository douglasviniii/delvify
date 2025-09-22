
import admin from 'firebase-admin';
import { config } from 'dotenv';

config({ path: '.env' });

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    admin.initializeApp();
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
