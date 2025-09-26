
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, type DocumentData, type DocumentSnapshot } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0GTV_m5oit8ddZeCmQ3hW7Jhh-LKiKG0",
  authDomain: "venda-fcil-pdv.firebaseapp.com",
  projectId: "venda-fcil-pdv",
  storageBucket: "venda-fcil-pdv.appspot.com",
  messagingSenderId: "114570788878",
  appId: "1:114570788878:web:5dd9f658d2b62fe762fc5f",
  measurementId: "G-H5JL1WQTGK"
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} else {
    // This case is for server-side rendering where window is not defined
    // and no app is initialized. We will initialize it.
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
}


// Helper para serializar documentos do Firestore (com timestamps) do lado do cliente
export const serializeDoc = (doc: DocumentSnapshot<DocumentData>): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    // Converte todos os campos de timestamp para strings ISO
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }

    return docData;
}


// @ts-ignore
export { app, auth, db, storage };
