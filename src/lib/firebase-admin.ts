
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

const ADMIN_APP_NAME = 'firebase-admin-app-delvify';

// Hardcoded service account details as provided.
const serviceAccount = {
  "type": "service_account",
  "project_id": "venda-fcil-pdv",
  "private_key_id": "a39e60e136c69c8f19fb694a989ef0a4a2af5ddf",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqXCUSir9Pl8v6\nYwT8ig6Vq1VvQRXWfjqRHcD43q4CYzPFtHUe8rhizSemHpG7+CSOptse0zg2+n38\nBWHiaz0+uSR79stHOg89Vj7CemsABdCgroLnj+T2iYT/c6EF+Y6mtELZKVxkvw+R\nQY/yfUfQ5edwl8+8XAp7Xtno1dFygQdfqFeUrItnS5lfaHMi20pcxMOXpadsKE/F\nbXRnk/ATAZQb5fNeyBAqtHJj4/aqLO7+Bvx/ly5asxF3OiilEoy9Uk0UJQ5CubJA\n+qlzH192H2qrWe5J0ZWMX34Dv3vf/SL0je8c4ng9qTL5M+rJaed+JWEbGSjTo39H\nOyiUF47vAgMBAAECggEALzMPbGc3oQg4EfvMPmHLr6kEJypbsA1SEbGyLOGZSX0N\ns4mPZ48tCea4RPy0OOWDz2goTo6LxSO6sxAUsiQvGEk4dAYJBQdvgHl8Muqy6ZMy\n3cnr59dEww+P4yy4oMynOsW3va4JdLpAyGhnRvJx6s0/xcCx5AiGOO8rJajT+kqU\nopXG3ZRgwe7NUS8i1gvkcoae0Nn4ilFDjVA4E0yV8Jni21W2XlSIiYWqVLNpkNF3\nTFRPfMkvC8PTRxgbrwRQqHemURTn+O420ZNB2F3mVVKZb1mZJjhHfnusWiXiqf17\nP/cROEA21X1Nn4l13gPj5Z0hCUnKWZo84LCninwEeQKBgQDYbrS0ETKMXIjMJ6C0\navmTKF2InW6VjFeO78JA+SHRTCv/Iuyd7oCiGcHHB4UW29jDb8wl7VWDv7GTww+s\nO7lovMY7YDzW53xz8jckk4runPNnpZKaYmkeRvH4ZBj9wwz2+G0mVNj/lFELlxHp\n6i/8J8LtLvs17OEDhRnOj6MkeQKBgQDJgTD5++CaXWEg1qH7HX75cTmJyIpx55KU\nQpCDafsxZ9wcO98/fG8B3uwdkD5xb9Z6KNuGgnTRx6bT5fUq0Ae7OsOX70nQl5Y1\n8WZpS1OwYbaXx8OrSo1fqoALCywEvNwFaw95sHqOnE0Mpah6yszofUo+MyZD5NAV\nAcIKQ+fkpwKBgQC+Bq1H8FWGYXSGc0CpR8drCiTdXwSJ71etGxteOp8TiaKTd1Fy\n9MYiDSVTH2oeANbX+V+v6SqM65D5YGlxWlrW9+/AkCW6tjJSBtedmKGCEXGwjfIi\n9MbAm5+17AT5QPkwGjyTTCnedJWX7IMA8upApZSC9R4BYcLKeWGIOBsQWQKBgQCJ\nQzL8puJp5MA8IVj3+TC8dK9wNyZvzwJfcjSFAFW3YvtiVDqQQZBQou0Oemq+1SMx\n1dEsgINZP3paD+SBBHKvzKjeP4d1yzzshANyKHjaxsUeAVs9vKwvBbLxUuvqUkhC\nfJpvF5N0v+4QdmwdMTaCDI7dbfRb/WrtVGQ8n+NAMwKBgQDME1OqErNraGwQtyj/\nuTtmNzbhH+73gVhtEGCk0mM8tnnjMw2FF+bmSKdzLLMYUuRfJtwyNUzOUg/b/6r6\nkqJkyw1njqyTe4wNGR6psVwHcDXoCLkFb4qdZHUaLz39npNiy63x6RKKHrmkJC93\niFM05PppUH5PVOu0TWqc2OQJRA==\n-----END PRIVATE KEY-----\n`,
  "client_email": "firebase-adminsdk-fbsvc@venda-fcil-pdv.iam.gserviceaccount.com",
  "client_id": "100681931275435978010",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40venda-fcil-pdv.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

/**
 * Initializes the Firebase Admin app with a unique name if it doesn't exist.
 * This prevents re-initialization errors in hot-reload environments.
 */
function initializeAdminApp() {
  if (getApps().some((app) => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }

  // Ensure all fields are present before initializing
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('As credenciais da conta de serviço do Firebase estão incompletas ou não foram encontradas.');
  }

  return initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    storageBucket: "venda-fcil-pdv.appspot.com",
  }, ADMIN_APP_NAME);
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
