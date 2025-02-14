'use client';

import { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user.uid);
      
      dispatch(setUser({ uid: userCredential.user.uid, email }));
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor="loginEmail">Username or Email</label>
      <input
        id="loginEmail"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginBottom: '1rem' }}
      />

      <label htmlFor="loginPassword">Password</label>
      <input
        id="loginPassword"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginBottom: '1rem' }}
      />

      <button type="submit" style={{ marginBottom: '1rem' }}>
        Log In
      </button>
    </form>
  );
}
