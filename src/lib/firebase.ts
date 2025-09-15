
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0GTV_m5oit8ddZeCmQ3hW7Jhh-LKiKG0",
  authDomain: "venda-fcil-pdv.firebaseapp.com",
  projectId: "venda-fcil-pdv",
  storageBucket: "venda-fcil-pdv.appspot.com",
  messagingSenderId: "100989312674",
  appId: "1:100989312674:web:0b793335520551772183c7",
  measurementId: "G-SH52S7W3DE"
};


// Se o app já estiver inicializado, use-o. Senão, inicialize.
// Isso evita erros de "app já existe" em ambientes de desenvolvimento.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };
