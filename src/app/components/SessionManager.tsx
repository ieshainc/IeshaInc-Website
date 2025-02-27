'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';

// This component manages auth state at the application level
// without rendering anything visible
export default function SessionManager() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const provider = user.providerData[0]?.providerId || null;
        
        dispatch(setUser({
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          provider: provider
        }));
      } else {
        dispatch(setUser({
          uid: null,
          email: null,
          displayName: null,
          provider: null
        }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // This component doesn't render anything visible
  return null;
} 