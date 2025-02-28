'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import UserProfileFields, {
  ProfileData,
} from '../components/userProfile/UserProfileFields';
import Link from 'next/link';
import RouteGuard from '../components/RouteGuard';

export default function ProfilePage() {
  const userAuth = useSelector((state: RootState) => state.user);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    hasPin: false,
    onboardingSkipped: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!userAuth.uid) {
      router.push('/auth?form=login');
    } else {
      setLoadingProfile(true);
      
      // Fetch profile data
      const fetchProfile = async () => {
        try {
          if (userAuth.uid) {
            const userDocRef = doc(db, 'users', userAuth.uid);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data() as Partial<ProfileData>;
              setProfile(prev => ({
                ...prev,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || '',
                address: data.address || '',
                hasPin: data.hasPin ?? false,
                onboardingSkipped: data.onboardingSkipped ?? false,
              }));
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          setLoadingProfile(false);
        }
      };
      
      fetchProfile();
    }
  }, [userAuth.uid, router]);

  // Reset status messages when editing state changes
  useEffect(() => {
    if (isEditing) {
      setSaveSuccess(false);
      setSaveError('');
    }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAuth.uid) {
      setSaveError('No user is signed in. Please sign in first.');
      return;
    }

    const { firstName, lastName, phone, address, hasPin } = profile;
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    // Check that all required fields are provided
    if (!trimmedFirstName || !trimmedLastName) {
      setSaveError('First and last name are required.');
      return;
    }
    
    if (!trimmedPhone) {
      setSaveError('Phone number is required.');
      return;
    }
    
    if (!trimmedAddress) {
      setSaveError('Address is required.');
      return;
    }
    
    // Validate phone number format
    if (!/^\d+$/.test(trimmedPhone)) {
      setSaveError('Phone must contain only digits.');
      return;
    }

    // Save to Firestore
    try {
      await setDoc(
        doc(db, 'users', userAuth.uid),
        {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phone: trimmedPhone,
          address: trimmedAddress,
          hasPin,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setIsEditing(false);
      setSaveSuccess(true);
      setSaveError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    }
  };

  const ViewOnlyProfile = () => {
    // Check if profile is incomplete
    const isProfileIncomplete = !profile.firstName || !profile.lastName || !profile.phone || !profile.address;

    return (
      <div className="space-y-6">
        {isProfileIncomplete && (
          <div className="rounded-md bg-yellow-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Profile incomplete</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your profile is missing required information.</p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/onboarding" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                      Complete your profile
                    </Link>
                    {profile.onboardingSkipped && (
                      <button 
                        onClick={async () => {
                          try {
                            if (userAuth.uid) {
                              // Reset the onboardingSkipped flag
                              await setDoc(
                                doc(db, 'users', userAuth.uid),
                                { onboardingSkipped: false },
                                { merge: true }
                              );
                              alert('Onboarding preference reset. You will now be prompted to complete your profile.');
                            }
                          } catch (error) {
                            console.error('Error resetting onboarding preference:', error);
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Reset skip preference
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Full Name</h3>
            <p className="mt-1 text-lg font-semibold">
              {profile.firstName && profile.lastName 
                ? `${profile.firstName} ${profile.lastName}` 
                : 'Not set'}
            </p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Email Address</h3>
            <p className="mt-1 text-lg font-semibold">{userAuth.email || 'Not available'}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Phone Number</h3>
            <p className="mt-1 text-lg font-semibold">{profile.phone || 'Not set'}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">PIN Status</h3>
            <p className="mt-1 text-lg font-semibold">
              {profile.hasPin ? (
                <span className="text-green-600">PIN set up</span>
              ) : (
                <span className="text-gray-500">No PIN set up</span>
              )}
            </p>
          </div>
        </div>
        
        {profile.address && (
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Address</h3>
            <p className="mt-1 text-lg font-semibold whitespace-pre-line">{profile.address}</p>
          </div>
        )}
        
        <div className="pt-5">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        </div>
      </div>
    );
  };

  if (loadingProfile) {
    return (
      <RouteGuard requireAuth={true} redirectUnauthenticatedTo='/auth'>
        <div className="py-6 flex justify-center">
          <div className="animate-pulse text-indigo-600">Loading profile...</div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth={true} redirectUnauthenticatedTo='/auth'>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">My Profile</h1>
        
        {saveSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Profile updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div>
                <p className="text-sm font-medium text-red-800">{saveError}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <UserProfileFields profile={profile} setProfile={setProfile} />
                <div className="mt-8 space-x-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <ViewOnlyProfile />
            )}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Authentication method: {userAuth.provider === 'password' ? 'Email' : 'Google'}</p>
        </div>
      </div>
    </RouteGuard>
  );
} 