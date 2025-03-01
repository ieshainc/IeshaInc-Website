'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../store/slices/userSlice';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface InactivityManagerProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export default function InactivityManager({
  children,
  timeoutMinutes = 1, // Default to 30 minutes timeout
  warningMinutes = .5,  // Show warning 5 minutes before timeout
}: InactivityManagerProps) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = user && user.uid !== null;
  
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
  
  // Function to handle user logout
  const handleLogout = useCallback(async () => {
    if (isAuthenticated) {
      try {
        console.log('InactivityManager - Logging out user due to inactivity');
        await signOut(auth);
        router.push('/auth?reason=inactivity');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  }, [isAuthenticated, router]);
  
  // Function to reset the timers
  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Hide warning if it's showing
    setShowWarning(false);
    
    if (isAuthenticated) {
      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        setSecondsRemaining(warningMinutes * 60);
        
        // Start countdown for remaining time
        countdownIntervalRef.current = setInterval(() => {
          setSecondsRemaining(prev => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      }, warningMs);
      
      // Set logout timer
      timerRef.current = setTimeout(handleLogout, timeoutMs);
    }
  }, [isAuthenticated, handleLogout, timeoutMs, warningMs, warningMinutes]);
  
  // Reset timers when user authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      resetTimers();
    } else {
      // Clear timers if user is not authenticated
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setShowWarning(false);
    }
    
    return () => {
      // Cleanup timers when component unmounts
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAuthenticated, resetTimers]);
  
  // Listen for user activity events to reset the timer
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const userActivityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];
    
    const handleUserActivity = () => {
      resetTimers();
    };
    
    // Add event listeners for user activity
    userActivityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      // Clean up event listeners
      userActivityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetTimers]);
  
  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <>
      {children}
      
      {/* Warning modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Session Timeout Warning</h3>
            <p className="mb-4">
              Your session will expire in {formatTime(secondsRemaining)} due to inactivity.
              Any unsaved changes will be lost.
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Logout Now
              </button>
              <button
                onClick={resetTimers}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 