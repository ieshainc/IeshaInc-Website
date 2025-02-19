'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../store/slices/userSlice';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  
  // Helper function to check if user is authenticated
  const isAuthenticated = user && user.uid !== null;

  useEffect(() => {
    console.log('RouteGuard - Current user state:', user);
    console.log('RouteGuard - Is authenticated:', isAuthenticated);
    console.log('RouteGuard - Require auth:', requireAuth);

    if (requireAuth && !isAuthenticated) {
    // Redirect to login page if user is not authenticated and route requires auth
      console.log('RouteGuard - Redirecting to auth page: No valid user found and auth required');
   //   router.push('/auth');
    } else if (!requireAuth && isAuthenticated) {
      // Redirect to dashboard/home if user is authenticated and trying to access public route
      console.log('RouteGuard - Redirecting to dashboard: Valid user found on public route');
  //    router.push('/dashboard');
    }
  }, [user, requireAuth, router, isAuthenticated]);

  // Show children only if authentication requirements are met
  if (requireAuth && !isAuthenticated) {
    console.log('RouteGuard - Rendering null: No valid user found and auth required');
    return null;
  }
  if (!requireAuth && isAuthenticated) {
    console.log('RouteGuard - Rendering null: Valid user found on public route');
    return null;
  }

  console.log('RouteGuard - Rendering children: Authentication requirements met');
  return <>{children}</>;
} 