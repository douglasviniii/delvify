
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// This is a simplified session management for server components.
// In a production app, you might use a library like NextAuth.js for more robust session handling.

export async function getCurrentUser(): Promise<any | null> {
  const authorization = headers().get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decodedToken.uid);
    return user;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}
