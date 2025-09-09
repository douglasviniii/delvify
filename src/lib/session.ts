
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// This is a simplified session management for server components.
// In a production app, you might use a library like NextAuth.js for more robust session handling.

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    // onAuthStateChanged returns an unsubscribe function, but we only need the first state change
    // for this promise-based approach.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Stop listening after we get the user state
      resolve(user);
    });
  });
}
