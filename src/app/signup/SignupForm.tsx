'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';
import GoogleAuth from '../components/GoogleAuth';
import styles from '../styles/GoogleAuth.module.css';

export default function SignupForm() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user.uid);
      
      dispatch(setUser({ 
        uid: userCredential.user.uid, 
        email, 
        displayName: userCredential.user.displayName 
      }));
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSignup} className={styles.form}>
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

        <button type="submit" className={styles.continueButton}>
          Sign Up with Email
        </button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <GoogleAuth />
      </form>
    </div>
  );
}
