
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import type { UserRecord } from 'firebase-admin/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

const getServiceAccount = () => {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não está definida.");
  }
  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  return JSON.parse(serviceAccountJson);
};


export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const tokens = await getTokens(cookies(), {
      apiKey: firebaseConfig.apiKey,
      cookieName: 'AuthToken',
      cookieSignatureKeys: ['secret1', 'secret2'],
      serviceAccount: getServiceAccount(),
    });

    if (!tokens) {
      return null;
    }
    const user = await adminAuth.getUser(tokens.decodedToken.uid);
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
