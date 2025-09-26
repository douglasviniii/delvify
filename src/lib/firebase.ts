
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, type DocumentData, type DocumentSnapshot } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

let firebaseInitialized = false;

async function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
        throw new Error('Failed to fetch Firebase config');
    }
    const firebaseConfig = await response.json();

    if (!firebaseConfig.apiKey) {
      throw new Error("API key is missing in the fetched Firebase config");
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Em um app real, você poderia ter um estado de erro global aqui.
  }
}

// Chame a inicialização. Como é async, o resto do código precisa esperar por ela.
// No entanto, como os exports são síncronos, isso é um desafio.
// A abordagem mais simples é garantir que a inicialização ocorra antes de qualquer uso.
// Chamadas subsequentes à `getFirebase` garantirão que está inicializado.
export const getFirebase = async () => {
    if (!firebaseInitialized) {
        await initializeFirebase();
    }
    return { app, auth, db, storage };
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

// Para compatibilidade com o código existente que importa diretamente auth, db, etc.
// Isso é um "hack" e em um mundo ideal, todo o código usaria `await getFirebase()`.
// Inicializamos com uma promise para que possamos esperar por ela se necessário.
const firebaseInitializationPromise = initializeFirebase();

export { app, auth, db, storage, firebaseInitializationPromise };
