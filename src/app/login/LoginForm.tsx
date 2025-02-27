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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user.uid);
      
      dispatch(setUser({ 
        uid: userCredential.user.uid, 
        email, 
        displayName: userCredential.user.displayName,
        provider: 'password'
      }));
      
      // Clear form fields after successful login
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error logging in:', error);
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
