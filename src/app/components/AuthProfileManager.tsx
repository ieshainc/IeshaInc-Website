'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function AuthProfileManager() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Paths to exclude from onboarding checks
  const excludedPaths = ['/auth', '/onboarding', '/logout'];
  const shouldSkipRedirect = excludedPaths.some(path => pathname.startsWith(path));
  
  // Add Firebase auth listener to ensure we're getting accurate auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setFirebaseUser(authUser);
      console.log('AuthProfileManager - Firebase auth state changed:', 
        authUser ? 'Authenticated' : 'Not authenticated');
    });
    return () => unsubscribe();
  }, []);
  
  // Reset the check when user changes or path changes to any non-excluded path
  useEffect(() => {
    // NOTE: We now check both Redux and Firebase auth state
    const isAuthenticated = (user?.uid !== null && user?.uid !== undefined) || 
                           (firebaseUser !== null && firebaseUser !== undefined);
                           
    // If user is logged in and we're on a path that's not excluded,
    // reset the profile check. This ensures any new pages added to the app 
    // will automatically check for onboarding completion.
    if (isAuthenticated && !shouldSkipRedirect) {
      setHasCheckedProfile(false);
    }
  }, [user.uid, firebaseUser, pathname, shouldSkipRedirect]);

  useEffect(() => {
    // Determine authentication status using both Redux and Firebase
    const isAuthenticated = (user?.uid !== null && user?.uid !== undefined) || 
                           (firebaseUser !== null && firebaseUser !== undefined);
    
    // Skip if we've already checked, if user is not authenticated, or we're on excluded paths
    if (hasCheckedProfile || !isAuthenticated || shouldSkipRedirect) {
      console.log('AuthProfileManager - Skipping check:', { 
        hasCheckedProfile, 
        isAuthenticated,
        reduxAuth: !!user.uid,
        firebaseAuth: !!firebaseUser,
        shouldSkipRedirect,
        pathname
      });
      return;
    }

    const checkProfileCompletion = async () => {
      try {
        // Use the most reliable user ID available
        const userId = user.uid || (firebaseUser?.uid);
        console.log('AuthProfileManager - Checking profile completion for user:', userId);
        
        if (userId) {
          const userDocRef = doc(db, 'users', userId);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            console.log('AuthProfileManager - User has no profile document, redirecting to onboarding');
            // User has no profile data at all, redirect to onboarding
            if (pathname !== '/onboarding') {
              // IMPORTANT: We're already on the onboarding page or route to it
              // Do NOT use immediate navigation - use a delay to avoid race conditions
              setTimeout(() => {
                // Only redirect if we're still not on the onboarding page
                if (window.location.pathname !== '/onboarding') {
                  console.log('AuthProfileManager - Redirecting to onboarding');
                  window.location.href = '/onboarding';
                }
              }, 1500); // Longer delay to give RouteGuard time to process first
            }
            return;
          }

          const userData = docSnap.data();
          
          // Check if user has explicitly skipped onboarding
          if (userData.onboardingSkipped === true) {
            console.log('AuthProfileManager - User previously skipped onboarding, not redirecting');
            return;
          }
          
          // Check if profile is incomplete (missing required fields)
          if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address) {
            console.log('AuthProfileManager - User profile is incomplete, redirecting to onboarding');
            // Redirect to onboarding if not already there
            if (pathname !== '/onboarding') {
              // IMPORTANT: We're already on the onboarding page or route to it
              // Do NOT use immediate navigation - use a delay to avoid race conditions
              setTimeout(() => {
                // Only redirect if we're still not on the onboarding page
                if (window.location.pathname !== '/onboarding') {
                  console.log('AuthProfileManager - Redirecting to onboarding');
                  window.location.href = '/onboarding';
                }
              }, 1500); // Longer delay to give RouteGuard time to process first
            }
          } else {
            console.log('AuthProfileManager - User profile is complete');
          }
        }
      } catch (error) {
        console.error('AuthProfileManager - Error checking profile status:', error);
      } finally {
        setHasCheckedProfile(true);
      }
    };

    // Add an even larger delay to ensure Firebase auth is fully initialized
    // This will ensure that RouteGuard has plenty of time to run first
    const timer = setTimeout(() => {
      checkProfileCompletion();
    }, 2000); // Increased from 1000ms to 2000ms to avoid race conditions

    return () => clearTimeout(timer);
  }, [user.uid, firebaseUser, pathname, hasCheckedProfile, shouldSkipRedirect]);

  // This component doesn't render anything visible
  return null;
} 