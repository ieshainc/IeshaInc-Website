'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../services/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import UserProfileFields, {
  ProfileData,
} from '../components/userProfile/UserProfileFields';
import RouteGuard from '../components/RouteGuard';

export default function OnboardingPage() {
  const router = useRouter();
  const userAuth = useSelector((state: RootState) => state.user);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    hasPin: false,
    onboardingSkipped: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Check profile status
  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (userAuth.uid) {
          // Get profile data
          const userDocRef = doc(db, 'users', userAuth.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<ProfileData>;
            
            // Update local state with existing data
            setProfile(prev => ({
              ...prev,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              phone: data.phone || '',
              address: data.address || '',
              hasPin: data.hasPin ?? false,
              onboardingSkipped: data.onboardingSkipped ?? false,
            }));

            // Check if profile is complete (all required fields filled)
            if (data.firstName && data.lastName && data.phone && data.address) {
              router.push('/profile');
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [userAuth.uid, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userAuth.uid) {
      setError('You must be logged in to save your profile');
      return;
    }
    
    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.phone || !profile.address) {
      setError('First name, last name, phone number, and address are required');
      return;
    }
    
    // Validate phone number format (digits only)
    if (!/^\d+$/.test(profile.phone)) {
      setError('Phone number must contain only digits (no spaces, dashes, or other characters)');
      return;
    }
    
    setSaving(true);
    
    try {
      const userDocRef = doc(db, 'users', userAuth.uid);
      await setDoc(userDocRef, profile, { merge: true });
      
      // Redirect to home page with query parameter indicating successful profile completion
      router.push('/?profileCompleted=true');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-4 text-indigo-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard requireAuth={true} redirectUnauthenticatedTo='/auth'>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Tell us a bit about yourself to get started.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <UserProfileFields profile={profile} setProfile={setProfile} />
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  setSaving(true);
                  try {
                    if (userAuth.uid) {
                      // Mark onboarding as skipped in Firestore
                      const userDocRef = doc(db, 'users', userAuth.uid);
                      await setDoc(
                        userDocRef, 
                        { onboardingSkipped: true }, 
                        { merge: true }
                      );
                      console.log('Onboarding skipped flag saved to user profile');
                    }
                  } catch (error) {
                    console.error('Error saving skip preference:', error);
                  } finally {
                    setSaving(false);
                    router.push('/');
                  }
                }}
                disabled={saving}
                className="w-full mt-3 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Processing...' : 'Skip for now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
} 