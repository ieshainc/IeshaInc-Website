"use client";
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiAlertCircle } from 'react-icons/fi';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export default function AdminUserDetails({ userId }: { userId: string }) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User details fetched:', userId, 'isDeleted:', data.isDeleted);
          
          setUserDetails({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            createdAt: data.createdAt?.toDate(),
            lastLogin: data.lastLogin?.toDate(),
            isDeleted: data.isDeleted === true,
            deletedAt: data.deletedAt ? data.deletedAt.toDate() : null
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!userDetails) {
    return <div>User details not found</div>;
  }

  return (
    <div>
      {userDetails.isDeleted && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Deleted Account</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This user account has been deleted from authentication but the data is preserved.</p>
                {userDetails.deletedAt && (
                  <p className="mt-1">
                    Deleted on: {userDetails.deletedAt.toLocaleDateString()} at {userDetails.deletedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Client Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and contact information.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userDetails.firstName} {userDetails.lastName}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userDetails.email}</dd>
              </div>
              {userDetails.isDeleted && (
                <div className="bg-red-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-red-500">Account status</dt>
                  <dd className="mt-1 text-sm text-red-700 sm:mt-0 sm:col-span-2">
                    Deleted
                    {userDetails.deletedAt && (
                      <span className="ml-2">
                        on {userDetails.deletedAt.toLocaleDateString()}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {userDetails.phoneNumber && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userDetails.phoneNumber}</dd>
                </div>
              )}
              {userDetails.address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userDetails.address}</dd>
                </div>
              )}
              {userDetails.createdAt && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Account created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails.createdAt.toLocaleDateString()} at {userDetails.createdAt.toLocaleTimeString()}
                  </dd>
                </div>
              )}
              {userDetails.lastLogin && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last login</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails.lastLogin.toLocaleDateString()} at {userDetails.lastLogin.toLocaleTimeString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 