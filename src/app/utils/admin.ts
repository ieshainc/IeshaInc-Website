import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setUserRole } from '../store/slices/userSlice';
import { Dispatch } from '@reduxjs/toolkit';

// Check if a user has admin role
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();
    
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Checks if a user has admin role in Firestore and updates Redux store if needed
 * @param uid User ID to check
 * @param dispatch Redux dispatch function
 * @param currentRole Current role in Redux store
 * @returns Promise<boolean> True if user is an admin
 */
export const checkAndUpdateAdminStatus = async (
  uid: string,
  dispatch: Dispatch,
  currentRole: string | null
): Promise<boolean> => {
  try {
    if (!uid) return false;
    
    // First check if the user already has admin role in Redux
    if (currentRole === 'admin') {
      console.log('User already has admin role in Redux');
      return true;
    }
    
    // Check Firestore for the user's role
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.role === "admin";
      
      // If user is an admin in Firestore but not in Redux, update Redux
      if (isAdmin && currentRole !== 'admin') {
        console.log('Updating Redux with admin role from Firestore');
        dispatch(setUserRole('admin'));
      }
      
      return isAdmin;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}; 