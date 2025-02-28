'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../store/slices/userSlice';
import RouteGuard from './RouteGuard';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const user = useAppSelector(selectUser);
  
  useEffect(() => {
    // Check if the current user is an admin (using the email from the example)
    const isAdmin = user?.email === 'contact@ieshainc.com';
    
    if (!isAdmin) {
      router.push('/');
    } else {
      setAuthorized(true);
    }
  }, [user, router]);

  // We're using our existing RouteGuard component for base authentication
  // and adding an additional admin check
  return (
    <RouteGuard requireAuth={true}>
      {authorized ? children : null}
    </RouteGuard>
  );
} 