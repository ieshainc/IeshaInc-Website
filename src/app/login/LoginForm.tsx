'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import styles from '../styles/GoogleAuth.module.css';
import GoogleAuth from '../components/GoogleAuth';
import { RootState } from '../store';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear input fields when user logs in with email/password
  useEffect(() => {
    if (user?.uid && user?.provider === 'password') {
      setEmail('');
      setPassword('');
    }
  }, [user?.uid, user?.provider]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user.uid);
      
      dispatch(setUser({
        uid: userCredential.user.uid,
        email,
        displayName: userCredential.user.displayName,
        provider: 'password',
        role: null
      }));
      
      // Clear form fields after successful login
      setEmail('');
      setPassword('');
      
      // Let the auth system handle redirection rather than directly navigating
      console.log('Login successful - auth system will handle redirection');
    } catch (error: unknown) {
      // Handle different error types without revealing specific credentials issues
      console.error('Error logging in:', error);
      
      // Cast to the Firebase error type with a code property
      const firebaseError = error as { code?: string; message?: string };
      
      // Firebase authentication error codes
      switch(firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-email':
          // Generic error for all credential issues (security best practice)
          setError('Invalid login credentials. Please check your information and try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later or reset your password.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError('An error occurred during sign in. Please try again.');
          break;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut(auth);
      console.log('User signed out successfully!');
      dispatch(clearUser());
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleLogin} className={styles.form}>
        {!(user?.uid && user?.provider === 'password') ? (
          <>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.continueButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </button>
          </>
        ) : (
          <button 
            type="button" 
            onClick={handleSignOut} 
            className={styles.continueButton} 
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        )}

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <GoogleAuth />
      </form>
    </div>
  );
}
