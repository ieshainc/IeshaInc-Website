'use client';

import { useState } from 'react';
import LoginForm from '../login/LoginForm'; 
import SignupForm from '../signup/SignupForm';

export default function AuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', paddingBottom: '10px' }}>
      {/* Login or Signup form */}
      {isSignUp ? <SignupForm /> : <LoginForm />}

      <button
        onClick={() => setIsSignUp(!isSignUp)}
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