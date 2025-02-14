'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';

export default function SignupForm() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user.uid);
      
      dispatch(setUser({ uid: userCredential.user.uid, email }));
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  return (
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor="signupEmail">Username or Email</label>
      <input
        id="signupEmail"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginBottom: '1rem' }}
      />

      <label htmlFor="signupPassword">Password</label>
      <input
        id="signupPassword"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginBottom: '1rem' }}
      />

      <button type="submit" style={{ marginBottom: '1rem' }}>
        Sign Up
      </button>
    </form>
  );
}
