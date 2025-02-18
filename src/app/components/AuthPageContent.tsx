'use client';

import { useState } from 'react';
import LoginForm from '../login/LoginForm'; 
import SignupForm from '../signup/SignupForm';

export default function AuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div style={{textAlign: 'center' }}>
      {/* Login or Signup form */}
      {isSignUp ? <SignupForm /> : <LoginForm />}

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{
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