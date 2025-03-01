'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../store/slices/userSlice';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectAuthenticatedTo?: string; 
  redirectUnauthenticatedTo?: string; 
}

export default function RouteGuard({ 
  children, 
  requireAuth = true,
  redirectAuthenticatedTo = '/about',
  redirectUnauthenticatedTo = '/auth'
}: RouteGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inactivityReason = searchParams.get('reason');
  const userFromRedux = useAppSelector(selectUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setFirebaseUser(authUser);
      console.log('RouteGuard - Firebase auth state changed:', 
        authUser ? 'Authenticated' : 'Not authenticated');
    });
    return () => unsubscribe();
  }, []);
  
  // Helper function to check if user is authenticated based on both Firebase and Redux
  const isAuthenticated = (userFromRedux && userFromRedux.uid !== null) || 
                          (firebaseUser !== null);

  useEffect(() => {
    // For debugging purposes only
    if (process.env.NODE_ENV !== 'production') {
      console.log('RouteGuard - Auth state:', { 
        isAuthenticated, 
        requireAuth, 
        reduxAuth: !!userFromRedux?.uid,
        firebaseAuth: !!firebaseUser,
        path: window.location.pathname,
        inactivityReason
      });
    }

    // Handle authentication routing
    const handleRouting = () => {
      // Check for inactivity redirect for auth pages
      if (!requireAuth && inactivityReason === 'inactivity') {
        console.log('RouteGuard - User redirected due to inactivity timeout');
        // We're already on the auth page, no need to redirect
        return true;
      }
      
      if (requireAuth && !isAuthenticated) {
        // Case 1: Route requires auth but user is not authenticated
        const redirectUrl = inactivityReason === 'inactivity'
          ? `${redirectUnauthenticatedTo}?reason=inactivity`
          : redirectUnauthenticatedTo;
          
        console.log('RouteGuard - User not authenticated, redirecting to:', redirectUrl);
        router.push(redirectUrl);
        return false;
      } 
      
      if (!requireAuth && isAuthenticated) {
        // Case 2: Route is for non-authenticated users but user is authenticated
        console.log('RouteGuard - User already authenticated, redirecting to:', redirectAuthenticatedTo);
        router.push(redirectAuthenticatedTo);
        return false;
      }
      
      // Case 3: Authentication requirements are met
      console.log('RouteGuard - Authentication requirements met, staying on page');
      return true;
    };

    // Allow component to render first, then check routing
    // Use a longer delay to ensure Firebase auth is fully initialized
    const timeoutId = setTimeout(() => {
      const canProceed = handleRouting();
      setIsChecking(false);
      
      // If we can't proceed, the router will handle the navigation
      if (!canProceed) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('RouteGuard - Redirecting user');
        }
      }
    }, 1000); // Increased to 1000ms to ensure Firebase auth is properly initialized

    return () => clearTimeout(timeoutId);
  }, [
    userFromRedux, 
    firebaseUser,
    requireAuth, 
    router, 
    isAuthenticated, 
    redirectAuthenticatedTo, 
    redirectUnauthenticatedTo,
    inactivityReason
  ]);

  // Show loading state while checking authentication
  if (isChecking) {
    return null; // Or return a loading spinner/component
  }

  // The useEffect will handle redirects, so we can just render the children
  // if we've made it this far
  return <>{children}</>;
} 