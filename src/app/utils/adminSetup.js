/**
 * Admin User Setup Script
 * 
 * This is a utility script to set up admin users in your application.
 * It should be run manually by a developer or system administrator.
 * 
 * Usage:
 * 1. Run with Node.js: node adminSetup.js
 * 2. Follow the prompts to set up an admin user
 */

// Import Firebase Admin SDK
// Note: You'll need to install these packages:
// npm install firebase-admin

const admin = require('firebase-admin');
const serviceAccount = require('../../../../../../../Downloads/ServiceAccountkey_mygamename-f90d8-firebase-adminsdk-iuoyt-8a978c2696.json');

// Initialize the admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Function to set admin role for a user by email
async function setAdminRole(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // First, find the user in Firebase Authentication
    const userRecord = await auth.getUserByEmail(email);
    
    if (!userRecord) {
      console.log('No matching user found in Firebase Authentication with email:', email);
      return;
    }
    
    console.log(`Found user in Firebase Auth: ${userRecord.uid}`);
    
    // Get the UID from Authentication
    const uid = userRecord.uid;
    
    // Now, check if a corresponding document exists in Firestore
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      // Update existing document
      await userDocRef.update({
        role: 'admin',
        email: email // Ensure email is stored in Firestore for future reference
      });
      console.log(`Updated existing user document with admin role: ${uid}`);
    } else {
      // Create a new document with the UID as the document ID
      await userDocRef.set({
        email: email,
        role: 'admin',
        // Include basic user info from Auth if available
        displayName: userRecord.displayName || '',
        firstName: userRecord.displayName ? userRecord.displayName.split(' ')[0] : '',
        lastName: userRecord.displayName ? userRecord.displayName.split(' ').slice(1).join(' ') : '',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Created new user document with admin role: ${uid}`);
    }
    
    // Set custom claims in Firebase Auth as an additional security layer
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`Set custom claims for user: ${uid}`);
    
    console.log(`Successfully set admin role for user: ${email} (${uid})`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

// Usage: node adminSetup.js admin@example.com
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address: node adminSetup.js admin@example.com');
  process.exit(1);
}

setAdminRole(email)
  .then(() => {
    console.log('Admin setup completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in admin setup:', error);
    process.exit(1);
  });

/**
 * IMPORTANT SECURITY NOTES:
 * 
 * 1. This script should be run in a secure environment only.
 * 2. Keep your service account key confidential and never commit it to version control.
 * 3. Consider implementing additional security checks before granting admin privileges.
 * 4. For production, implement proper role management with audit trails.
 * 
 * ADDITIONAL STEPS FOR PROPER ADMIN SETUP:
 * 
 * 1. Implement a middleware in your backend to verify admin status
 * 2. Set up proper access control rules in Firestore
 * 3. Implement rate limiting for admin operations
 * 4. Set up audit logs for admin actions
 */ 