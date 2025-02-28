import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppDispatch } from '../store';
import { setUserRole } from '../store/slices/userSlice';

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

// Check and update Redux store with user's admin status
// This function is useful when admin status needs to be refreshed
export async function checkAndUpdateAdminStatus(
  uid: string, 
  dispatch: AppDispatch, 
  currentRole: string | null = null
): Promise<boolean> {
  if (!uid) return false;
  
  try {
    console.log('Checking admin status for user:', uid);
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    
    // Only update Redux if the role has changed
    if (currentRole !== userData?.role) {
      console.log('Updating user role in Redux:', userData?.role);
      dispatch(setUserRole(userData?.role || null));
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking and updating admin status:', error);
    return false;
  }
} 