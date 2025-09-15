
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


export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const tokens = await getTokens(cookies(), {
      apiKey: firebaseConfig.apiKey,
      cookieName: 'AuthToken',
      cookieSignatureKeys: ['secret1', 'secret2'],
    });

    if (!tokens) {
      console.log("Nenhum token encontrado, usuário não autenticado.");
      return null;
    }
    
    const user = await adminAuth.verifyIdToken(tokens.token);
    
    return await adminAuth.getUser(user.uid);

  } catch (error) {
    console.error('Erro ao buscar o usuário atual:', error);
    return null;
  }
}
