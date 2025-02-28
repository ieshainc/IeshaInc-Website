'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function AuthProfileManager() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Skip on these paths even if profile is incomplete
  const excludedPaths = ['/auth', '/onboarding', '/logout'];
  const shouldSkipRedirect = excludedPaths.some(path => pathname.startsWith(path));
  
  // Reset the check when user changes or path changes to key areas
  useEffect(() => {
    if (user.uid && (pathname === '/' || pathname === '/profile')) {
      setHasCheckedProfile(false);
    }
  }, [user.uid, pathname]);

  useEffect(() => {
    // Skip if we've already checked, if user is not authenticated, or we're on excluded paths
    if (hasCheckedProfile || !user.uid || shouldSkipRedirect) {
      return;
    }

    const checkProfileCompletion = async () => {
      try {
        console.log('Checking profile completion for user:', user.uid);
        // We already checked that user.uid exists above
        if (user.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            console.log('User has no profile document, redirecting to onboarding');
            // User has no profile data at all, redirect to onboarding
            if (pathname !== '/onboarding') {
              router.push('/onboarding');
            }
            return;
          }

          const userData = docSnap.data();
          
          // Check if user has explicitly skipped onboarding
          if (userData.onboardingSkipped === true) {
            console.log('User previously skipped onboarding, not redirecting');
            return;
          }
          
          // Check if profile is incomplete (missing required fields)
          if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address) {
            console.log('User profile is incomplete, redirecting to onboarding');
            // Redirect to onboarding if not already there
            if (pathname !== '/onboarding') {
              router.push('/onboarding');
            }
          } else {
            console.log('User profile is complete');
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setHasCheckedProfile(true);
      }
    };

    // Add a small delay to ensure Firebase auth is fully initialized
    const timer = setTimeout(() => {
      checkProfileCompletion();
    }, 500);

    return () => clearTimeout(timer);
  }, [user.uid, pathname, router, hasCheckedProfile, shouldSkipRedirect]);

  // This component doesn't render anything visible
  return null;
} 