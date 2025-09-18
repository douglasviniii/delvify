
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import type { UserRecord } from 'firebase-admin/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0GTV_m5oit8ddZeCmQ3hW7Jhh-LKiKG0",
  authDomain: "venda-fcil-pdv.firebaseapp.com",
  projectId: "venda-fcil-pdv",
  storageBucket: "venda-fcil-pdv.firebasestorage.app",
  messagingSenderId: "114570788878",
  appId: "1:114570788878:web:1e3fa51754f3ae6862fc5f",
  measurementId: "G-792KHTQP7R",
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
