import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Se o app já estiver inicializado, use-o. Senão, inicialize.
// Isso evita erros de "app já existe" em ambientes de desenvolvimento.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

// Inicializa o storage com a URL do bucket para garantir que ele seja encontrado.
const storage = getStorage(app, process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}` : undefined);


export { app, auth, db, storage };
