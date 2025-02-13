'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './services/firebase';
// If you want to store user data in Redux, import your setUser action, etc.
// import { useAppDispatch } from '@/src/hooks/useAppDispatch';
// import { setUser } from '@/src/store/slices/userSlice';

export default function AuthPage() {
  // const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      if (isSignUp) {
        // CREATE a new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.uid);

        // Optionally dispatch to Redux:
        // dispatch(setUser({ uid: userCredential.user.uid, email }));

      } else {
        // SIGN IN existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user.uid);

        // Optionally dispatch to Redux:
        // dispatch(setUser({ uid: userCredential.user.uid, email }));
      }
    } catch (error) {
      console.error('Firebase Auth Error:', error);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <button type="submit">
          {isSignUp ? 'Create Account' : 'Login'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp((prev) => !prev)}
        style={{ marginTop: '1rem' }}
      >
        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}
