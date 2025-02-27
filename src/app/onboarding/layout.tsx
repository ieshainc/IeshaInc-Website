'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!user.uid) {
      router.push('/auth?form=login');
    }
  }, [user.uid, router]);

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user.uid) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
} 