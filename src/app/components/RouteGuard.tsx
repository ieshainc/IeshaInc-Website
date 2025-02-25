'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../store/slices/userSlice';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectAuthenticatedTo?: string; // New prop for custom redirect path for authenticated users
  redirectUnauthenticatedTo?: string; // New prop for custom redirect path for unauthenticated users
}

export default function RouteGuard({ 
  children, 
  requireAuth = true,
  redirectAuthenticatedTo = '/dashboard',
  redirectUnauthenticatedTo = '/auth'
}: RouteGuardProps) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [isChecking, setIsChecking] = useState(true);
  
  // Helper function to check if user is authenticated
  const isAuthenticated = user && user.uid !== null;

  useEffect(() => {
    // For debugging purposes only
    if (process.env.NODE_ENV !== 'production') {
      console.log('RouteGuard - Auth state:', { 
        isAuthenticated, 
        requireAuth, 
        user: user?.uid ? 'Authenticated' : 'Unauthenticated' 
      });
    }

    // Handle authentication routing
    const handleRouting = () => {
      if (requireAuth && !isAuthenticated) {
        // Case 1: Route requires auth but user is not authenticated
        router.push(redirectUnauthenticatedTo);
        return false;
      } 
      
      if (!requireAuth && isAuthenticated) {
        // Case 2: Route is for non-authenticated users but user is authenticated
        router.push(redirectAuthenticatedTo);
        return false;
      }
      
      // Case 3: Authentication requirements are met
      return true;
    };

    // Allow component to render first, then check routing
    const timeoutId = setTimeout(() => {
      const canProceed = handleRouting();
      setIsChecking(false);
      
      // If we can't proceed, the router will handle the navigation
      if (!canProceed) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('RouteGuard - Redirecting user');
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    user, 
    requireAuth, 
    router, 
    isAuthenticated, 
    redirectAuthenticatedTo, 
    redirectUnauthenticatedTo
  ]);

  // Show loading state while checking authentication
  if (isChecking) {
    return null; // Or return a loading spinner/component
  }

  // The useEffect will handle redirects, so we can just render the children
  // if we've made it this far
  return <>{children}</>;
} 