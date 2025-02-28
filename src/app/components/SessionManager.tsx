'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setUser } from '../store/slices/userSlice';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// This component manages auth state at the application level
// without rendering anything visible
export default function SessionManager() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const provider = user.providerData[0]?.providerId || null;
        
        // Always ensure the user has a complete record in Firestore
        try {
          // Define a retry mechanism for critical Firestore operations
          const ensureUserDocumentWithRetry = async (maxRetries = 3) => {
            let retryCount = 0;
            let success = false;
            
            while (!success && retryCount < maxRetries) {
              try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                  // User document exists - get role and ensure email is up to date
                  const userData = userDoc.data();
                  const role = userData.role || null;
                  
                  // CRITICAL: Always ensure email field is present and correct
                  // This is especially important for OAuth users
                  if (!userData.email || userData.email !== user.email) {
                    console.log('Updating user email in Firestore:', user.email);
                    await setDoc(userDocRef, { 
                      email: user.email,
                      lastLogin: new Date() 
                    }, { merge: true });
                  } else {
                    // Just update last login timestamp
                    await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
                  }
                  
                  // Successfully updated user document
                  success = true;
                  
                  // Update Redux state with user data including role from Firestore
                  dispatch(setUser({
                    uid: user.uid,
                    email: user.email || null,
                    displayName: user.displayName || null,
                    provider: provider,
                    role: role
                  }));
                } else {
                  // No user document - create one with complete info from Auth
                  console.log('Creating new user document in Firestore for:', user.uid);
                  await setDoc(userDocRef, {
                    email: user.email, // This is critical - ensure email is always saved
                    displayName: user.displayName || null,
                    provider: provider,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    role: null,
                    onboardingCompleted: false
                  });
                  
                  // Successfully created user document
                  success = true;
                  
                  // Update Redux state with user data (no role yet)
                  dispatch(setUser({
                    uid: user.uid,
                    email: user.email || null,
                    displayName: user.displayName || null,
                    provider: provider,
                    role: null
                  }));
                }
              } catch (error) {
                retryCount++;
                console.error(`Error in Firestore operation (Attempt ${retryCount}):`, error);
                
                if (retryCount < maxRetries) {
                  console.log(`Retrying Firestore operation in 1 second...`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
            
            return success;
          };
          
          // Execute the retry function
          const firestoreSuccess = await ensureUserDocumentWithRetry();
          
          // If Firestore operations failed after retries, still update Redux state
          if (!firestoreSuccess) {
            console.error('Failed to ensure user document in Firestore after multiple retries');
            dispatch(setUser({
              uid: user.uid,
              email: user.email || null,
              displayName: user.displayName || null,
              provider: provider,
              role: null
            }));
          }
        } catch (error) {
          console.error('Unhandled error in session management:', error);
          // Still update Redux state even if Firestore operations fail
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

  // This component doesn't render anything visible
  return null;
} 