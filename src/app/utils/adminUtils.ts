import { db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Checks if a user has admin privileges
 * @param userId The user's ID to check for admin status
 * @returns Promise<boolean> True if user is an admin
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === "admin";
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Sets the admin role for a user
 * @param userId The user's ID to set as admin
 * @returns Promise<boolean> True if successful
 */
export const setAdminRole = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    await setDoc(
      doc(db, "users", userId),
      { role: "admin" },
      { merge: true }
    );
    
    return true;
  } catch (error) {
    console.error("Error setting admin role:", error);
    return false;
  }
}; 