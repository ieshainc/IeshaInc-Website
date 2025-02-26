import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    if (!serviceAccount.project_id) {
      throw new Error('Firebase service account not configured');
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  
  return getAuth();
}

/**
 * Create a session cookie from a Firebase ID token
 */
export async function createSessionCookie(
  idToken: string, 
  options: { expiresIn: number }
) {
  const auth = getFirebaseAdmin();
  return auth.createSessionCookie(idToken, options);
}

/**
 * Verify a session cookie and return the user record
 */
export async function verifySessionCookie(
  sessionCookie: string
): Promise<UserRecord> {
  const auth = getFirebaseAdmin();
  const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
  
  // Get the full user record
  return await auth.getUser(decodedClaims.uid);
}

/**
 * Revoke refresh tokens for a user
 */
export async function revokeRefreshTokens(uid: string) {
  const auth = getFirebaseAdmin();
  return auth.revokeRefreshTokens(uid);
} 