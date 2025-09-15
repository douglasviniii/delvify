
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: "venda-fcil-pdv",
    clientEmail: "firebase-adminsdk-fbsvc@venda-fcil-pdv.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1nTZa0GlI6YVF\nObob1HbciyS545Ec21TCm5CnCdwIweipEzYvWoCzD7tFUw95c4h1+uHJ5wVaBOcK\na8vpVTHCAxbRUcWba92njeEv0ZqCDcLIngAmtfctTc1+f/vEcvLtC3eUDqd8OGr5\n6cvs+TGFoAkY1jYFWn9mvyka2dRn1vm7rxUb2jZ9tnGXVLS39NxmqRRwwr9YUJ6X\n/BX/5Mjv/NGqRphGr/PtEsFY1iagINlMN3C/kh5Q+4FfDBKf5vFIWtmQ6ZNkrbM0\nktrsCbwQgSD4kpJVXTUKpE/ATfUzpzvvr9ACkNHnz7wL3J8w28iEt5XR0THzSSY0\nMXiVRrBLAgMBAAECggEAVOq8RnwaLmhZ0wNp3KdcKES7GFuqNzbqi8/XM/MtOb8I\n/T0pYbzMXm0loAV1P9FgZeG3fwMRAoU2Ti4W+vPFvzRYj+jPH5uw2S5Cs2wq9VJf\n2BPgeDku6LTvN42596HTqjhpYgX0E+YBRvclTZk6qYMpnb5TJe+pkC4jlxVw9lfG\n89JyrdJKvzh56jimNm6iYIlyodDk+oifIzVTT5G3H1PZbgEemgGxoiHFVIwAx7aE\n7e0lxYxtE4Qs+nmCPJPJL02Bd8Bi0chMQudBB+axsbRb3MuBewYG7fyQ+ORSq3jb\nFPoaKyeQ+UGD02gK4s/vZUxk9irSig02gVvPkxxBAQKBgQD8F1ombdOjukLUw7sq\n967c+99Xb0sfUkMwrESvw0lIU9xq3LTakj2IvgWaHUr/ZmkXR/wHeotPpx5QpS6L\nauUz4B6QAcUxFO96a4ah8Dfubv+qvvTE30zb06p1zc0a2QbLRXM0hQB6J6CGYJ0c\nglrCj0S7tDDNvh94enfCgAKlywKBgQC4bhvztxT6y4L5mE4FKwaOlTiKJIi8ghVV\n1BYuv6CVmG8oyltO0UqydsLWj6KIuwXSvPHFU/IXgUKZRjrSntBASvb3Ksq0WVub\njEH7nsfBpcQVGNTHnfwU1+AJeI20mk6UjmyAT9fWa3FkOluewvcRQpoj1mZZMH6t\nvutNg2bPgQKBgGRCoV8hVQgMH2JhikI3iftnzVcH83e8ju5/xT2mTLIQcFyr9N3t\nRb3p3W6C8f4L7AYPYiRTT67ZR4xJde6LECeGnoElwxiXO/uTYlNrp8MTsGlnUxAt\nw3K2h1gdBtMDt9kGgSBFOYBb3FM1f6cEDTbOJkcFDlf1oqyXAKSBpwvrAoGAFn2W\n+wmAjXTz6+we15J/ojOgSXhbFGHoqCbM7baApr2IELlcmSf8q/a/m9q4P2RPOXvB\nIAc0ppkkvfxKgBTN4IlDxLB7N7MN8NIR2dVrFrpYRxpYGF+ztfb9YypIXZXTr1oO\n8TbLY2KG2Wokch/kcT5l/ajPomC/kgCOQU2c5AECgYEA1m43nMdFjTFEGiHixcGi\n61dSKwUvva0QH6LxAzFBybIq8WfEWAqSAiHkuikNqBy54EDqBSTljprd+Nhrs1lo\nbFLjUy3WvmqH+f5J4UowgWxnWIB3oT7dl5mNpmDM/3nwaJB4CStyTCUqJv81FEK1\n8CA1o0oT14OFjE6g53zc3VU=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  }),
  storageBucket: 'venda-fcil-pdv.appspot.com',
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp(firebaseAdminConfig);
    console.log("Firebase Admin SDK initialized.");
  }
  return getApp();
}

export function getAdminDb() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

export function getAdminStorage() {
  initializeFirebaseAdmin();
  return admin.storage();
}

// For backwards compatibility with existing code, we can export these.
// However, the functions above are preferred.
const adminDb = getAdminDb();
const adminAuth = getAdminAuth();
const adminStorage = getAdminStorage();

export { adminDb, adminAuth, adminStorage };
