import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

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