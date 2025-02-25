'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { setUser, clearUser } from '../store/slices/userSlice';

interface AuthStateListenerProps {
  children?: React.ReactNode;
  isMobile?: boolean;
}

export default function AuthStateListener({ children, isMobile = false }: AuthStateListenerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth?form=login');
  };

  const handleCreateAccount = () => {
    router.push('/auth?form=signup');
  };

  // If children are provided, just wrap them (original behavior)
  if (children) {
    return <>{children}</>;
  }

  // Otherwise, render auth buttons
  if (user.uid) {
    // User is logged in
    return (
      <div className={isMobile ? "block" : "flex items-center space-x-3"}>
        {isMobile && (
          <span className="block mb-2 text-sm font-medium text-gray-700">
            {user.displayName || user.email}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className={`${isMobile ? "w-full" : ""} px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          Sign Out
        </button>
      </div>
    );
  }
  
  // User is not logged in
  return (
    <div className={isMobile ? "space-y-3" : "flex items-center space-x-3"}>
      <button
        onClick={handleSignIn}
        className={`${isMobile ? "w-full" : ""} px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      >
        Sign In
      </button>
      <button
        onClick={handleCreateAccount}
        className={`${isMobile ? "w-full" : ""} px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      >
        Create Account
      </button>
    </div>
  );
} 