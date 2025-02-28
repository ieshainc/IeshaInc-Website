"use client";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { checkAndUpdateAdminStatus } from '../utils/admin';
import RouteGuard from './RouteGuard';
import LoadingSpinner from './LoadingSpinner';
import { useAppDispatch } from '../hooks/useAppDispatch';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This function checks if the current user has admin privileges
    const checkAdminStatus = async () => {
      // If no user is logged in, set authorized to false
      // This will be handled by the RouteGuard which will redirect to login
      if (!user.uid) {
        setAuthorized(false);
        return;
      }

      try {
        // Use the enhanced admin check that also updates Redux
        console.log('AdminRoute - Checking admin status for:', user.uid);
        
        // This will both check admin status AND update the Redux store if needed
        const isAdmin = await checkAndUpdateAdminStatus(user.uid, dispatch, user.role);
        
        if (!isAdmin) {
          // User is logged in but not an admin - redirect to home page
          console.log('User is not an admin, redirecting to home');
          // Use window.location.href instead of router.push for more consistent routing
          window.location.href = '/';
          setAuthorized(false);
        } else {
          // User is both logged in and an admin
          console.log('User is confirmed as admin in AdminRoute');
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        // On error, redirect to home page
        // Use window.location.href instead of router.push for more consistent routing
        window.location.href = '/';
        setAuthorized(false);
      }
    };

    checkAdminStatus();
  }, [user.uid, user.role, dispatch]); // Removed router from dependencies since we're not using it anymore

  // Show loading spinner while checking admin status
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Use RouteGuard to handle authentication checking and redirect to login if needed
  // Only render children if the user is authorized (is an admin)
  return (
    <RouteGuard requireAuth={true} redirectUnauthenticatedTo="/auth">
      {authorized ? children : null}
    </RouteGuard>
  );
}