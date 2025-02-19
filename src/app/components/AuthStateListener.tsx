'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser } from '../store/slices/userSlice';

export default function AuthStateListener({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null
        }));
      } else {
        dispatch(setUser({
          uid: null,
          email: null,
          displayName: null
        }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
} 