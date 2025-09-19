
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase (copiada do console)
const firebaseConfig = {
  apiKey: "AIzaSyB0GTV_m5oit8ddZeCmQ3hW7Jhh-LKiKG0",
  authDomain: "venda-fcil-pdv.firebaseapp.com",
  projectId: "venda-fcil-pdv",
  storageBucket: "venda-fcil-pdv.firebasestorage.app",
  messagingSenderId: "114570788878",
  appId: "1:114570788878:web:1e3fa51754f3ae6862fc5f",
  measurementId: "G-792KHTQP7R",
  databaseURL: "https://venda-fcil-pdv.firebaseio.com"
};


// Se o app já estiver inicializado, use-o. Senão, inicialize.
// Isso evita erros de "app já existe" em ambientes de desenvolvimento.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const serializeDoc = (doc: any): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    // Ensure all timestamp fields are converted to ISO strings
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }

    return docData;
}


export { app, auth, db, storage };
