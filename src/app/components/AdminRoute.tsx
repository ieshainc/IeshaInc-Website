"use client";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRouter } from 'next/navigation';
import { isUserAdmin } from '../utils/admin';
import RouteGuard from './RouteGuard';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

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
        // Check if the user has admin role
        const isAdmin = await isUserAdmin(user.uid);
        
        if (!isAdmin) {
          // User is logged in but not an admin - redirect to home page
          console.log('User is not an admin, redirecting to home');
          router.push('/');
          setAuthorized(false);
        } else {
          // User is both logged in and an admin
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        // On error, redirect to home page
        router.push('/');
        setAuthorized(false);
      }
    };

    checkAdminStatus();
  }, [user.uid, router]);

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
    <RouteGuard requireAuth={true} redirectUnauthenticatedTo="/login">
      {authorized ? children : null}
    </RouteGuard>
  );
}