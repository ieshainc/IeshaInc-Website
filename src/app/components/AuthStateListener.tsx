'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { setUser, clearUser } from '../store/slices/userSlice';
import { doc, getDoc } from 'firebase/firestore';

interface AuthStateListenerProps {
  children?: React.ReactNode;
  isMobile?: boolean;
}

export default function AuthStateListener({ children, isMobile = false }: AuthStateListenerProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const provider = user.providerData[0]?.providerId || null;
        
        try {
          // Check Firestore for user role immediately
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const role = userDoc.exists() ? userDoc.data()?.role || null : null;
          
          console.log('AuthStateListener - User role from Firestore:', role);
          
          // Update Redux state with complete user info including role
          dispatch(setUser({
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            provider: provider,
            role: role
          }));
        } catch (error) {
          console.error('Error fetching user role in AuthStateListener:', error);
          // Update Redux without role information if there's an error
          dispatch(setUser({
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            provider: provider,
            role: null
          }));
        }
      } else {
        dispatch(setUser({
          uid: null,
          email: null,
          displayName: null,
          provider: null,
          role: null
        }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      dispatch(clearUser());
      setIsLoggingOut(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSignIn = () => {
    // Use window.location instead of router.push for cleaner navigation
    window.location.href = '/auth?form=login';
  };

  const handleCreateAccount = () => {
    // Use window.location instead of router.push for cleaner navigation
    window.location.href = '/auth?form=signup';
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
          disabled={isLoggingOut}
          className={`${isMobile ? "w-full" : ""} px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50`}
        >
          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
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