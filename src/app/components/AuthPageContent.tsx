'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '../login/LoginForm'; 
import SignupForm from '../signup/SignupForm';

/**
 * AuthPageContent - A component that handles displaying either the login or signup form
 * and allows users to switch between them.
 */
export default function AuthPageContent() {
  // Get the URL query parameters
  const searchParams = useSearchParams();
  
  // State to track whether to show signup form (true) or login form (false)
  const [isSignUp, setIsSignUp] = useState(false);
  // Get the reason parameter from URL
  const inactivityReason = searchParams.get('reason');
  
  // Check URL parameters when component loads
  useEffect(() => {
    // If URL contains ?form=signup, show signup form
    if (searchParams.get('form') === 'signup') {
      setIsSignUp(true);
    } 
    // If URL contains ?form=login, show login form
    else if (searchParams.get('form') === 'login') {
      setIsSignUp(false);
    }
  }, [searchParams]);

  // Toggle between signup and login forms
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', paddingBottom: '10px' }}>
      {/* Display inactivity timeout message if redirected for that reason */}
      {inactivityReason === 'inactivity' && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded" role="alert">
          <p className="font-bold">Session Expired</p>
          <p>Your session has expired due to inactivity. Please log in again to continue.</p>
        </div>
      )}
      
      {/* Login or Signup form */}
      {isSignUp ? <SignupForm /> : <LoginForm />}

      <button
        onClick={toggleAuthMode}
        style={{
          marginTop: '1rem',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'blue',
          cursor: 'pointer'
        }}
      >
        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}