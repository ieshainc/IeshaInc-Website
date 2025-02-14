'use client';

import { useState } from 'react';
import LoginForm from '../login/LoginForm'; 
import SignupForm from '../signup/SignupForm';

export default function AuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      {/* Google Sign-In button, toggles, etc. */}
      {isSignUp ? <SignupForm /> : <LoginForm />}

      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}
