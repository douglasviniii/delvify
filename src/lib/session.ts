
'use server';

import { getAdminAuth } from '@/lib/firebase-admin';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import type { UserRecord } from 'firebase-admin/auth';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const tokens = await getTokens(cookies(), {
      apiKey: firebaseApiKey,
      cookieName: 'AuthToken',
      cookieSignatureKeys: ['secret1', 'secret2'],
    });

    if (!tokens) {
      console.log("Nenhum token encontrado, usuário não autenticado.");
      return null;
    }
    
    const adminAuth = getAdminAuth();
    const user = await adminAuth.verifyIdToken(tokens.token);
    
    return await adminAuth.getUser(user.uid);

  } catch (error) {
    console.error('Erro ao buscar o usuário atual:', error);
    return null;
  }
}
