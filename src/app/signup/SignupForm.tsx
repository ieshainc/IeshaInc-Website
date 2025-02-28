'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';
import GoogleAuth from '../components/GoogleAuth';
import styles from '../styles/GoogleAuth.module.css';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupForm() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Authentication:', userCredential.user.uid);
      
      // CRITICAL: Create a corresponding document in Firestore
      // We'll retry this operation if it fails to ensure consistency
      let firestoreSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!firestoreSuccess && retryCount < maxRetries) {
        try {
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, {
            email: email, // Ensure email is always saved
            displayName: userCredential.user.displayName || '',
            provider: 'password',
            createdAt: new Date(),
            lastLogin: new Date(),
            role: null,
            onboardingCompleted: false
          });
          console.log('User document successfully created in Firestore');
          firestoreSuccess = true;
        } catch (firestoreError) {
          retryCount++;
          console.error(`Error creating user document in Firestore (Attempt ${retryCount}):`, firestoreError);
          
          if (retryCount < maxRetries) {
            console.log(`Retrying Firestore document creation in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!firestoreSuccess) {
        console.error('Failed to create user document in Firestore after multiple attempts');
        // Continue with authentication but log this issue
      }
      
      // Update Redux state
      dispatch(setUser({
        uid: userCredential.user.uid,
        email,
        displayName: userCredential.user.displayName,
        provider: 'password',
        role: null
      }));
      
      // No longer use direct navigation
      console.log('Account created successfully - auth system will handle redirection');
      
      // Clear loading state after account creation
      setLoading(false);
      
    } catch (error) {
      console.error('Error creating account:', error);
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          setError('This email is already registered. Please try logging in instead.');
        } else if (error.message.includes('weak-password')) {
          setError('Password is too weak. Please use at least 6 characters.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSignup} className={styles.form}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className={styles.inputGroup}>
          <label htmlFor="signupEmail">Email</label>
          <input
            id="signupEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="signupPassword">Password</label>
          <input
            id="signupPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <button 
          type="submit" 
          className={styles.continueButton}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up with Email'}
        </button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <GoogleAuth />
      </form>
    </div>
  );
}
