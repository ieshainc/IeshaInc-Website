'use server';

import { cookies } from 'next/headers';
import { createSessionCookie, verifySessionCookie } from '../services/firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';

/**
 * Create a server-side session after client-side Firebase authentication
 * @param idToken Firebase ID token from client
 */
export async function createServerSession(idToken: string) {
  try {
    // Convert Firebase ID token to a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await createSessionCookie(idToken, { expiresIn });
    
    // Set cookie for future requests
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to create session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

/**
 * Verify the current user's session
 * @returns User record if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return null;
    }
    
    // Verify the session cookie and get the user
    const decodedClaims = await verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Clear the user's session (logout)
 */
export async function clearServerSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
} 