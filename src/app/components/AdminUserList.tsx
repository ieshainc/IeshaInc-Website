"use client";
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import AdminUserFiles from './AdminUserFiles';
import AdminUserDetails from './AdminUserDetails';
import { FiUser, FiSearch, FiUsers, FiAlertCircle, FiUserX, FiShield } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { checkIsAdmin } from '../utils/adminUtils';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  createdAt?: Date;
  role?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export default function AdminUserList() {
  const userAuth = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'details'>('files');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the current user is an admin
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (userAuth?.uid) {
        const adminStatus = await checkIsAdmin(userAuth.uid);
        setIsAdmin(adminStatus);
        
        // If not admin, set an error message
        if (!adminStatus) {
          setError('You do not have permission to access this page. Admin privileges are required.');
          setLoading(false);
        }
      }
    };
    
    verifyAdminStatus();
  }, [userAuth?.uid]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Only proceed if user is admin
        if (!isAdmin) {
          return;
        }
        
        setError(null);
        const usersRef = collection(db, 'users');
        
        // Create a query that can handle potential missing fields
        let q;
        try {
          q = query(usersRef, orderBy('lastName'), orderBy('firstName'));
        } catch (err) {
          // If orderBy fails (maybe fields don't exist), use a simpler query
          q = query(usersRef);
          console.warn('Using simple query due to missing index or field:', err);
        }
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const userData: UserData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userData.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            role: data.role || '',
            // Make sure we're correctly reading these fields
            isDeleted: data.isDeleted === true, // Explicitly check for true
            deletedAt: data.deletedAt ? data.deletedAt.toDate() : null
          });
        });
        
        // Debug: Log deleted users information
        const deletedUsers = userData.filter(user => user.isDeleted);
        console.log('Deleted users found:', deletedUsers.length, deletedUsers);
        
        // Sort users client-side if there are fields missing
        const sortedUsers = userData.sort((a, b) => {
          const lastNameCompare = (a.lastName || '').localeCompare(b.lastName || '');
          if (lastNameCompare !== 0) return lastNameCompare;
          return (a.firstName || '').localeCompare(b.firstName || '');
        });
        
        setUsers(sortedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users: ' + (error instanceof Error ? error.message : 'Unknown error') + 
                '. You may not have sufficient permissions to view this data.');
        setLoading(false);
      }
    };

    // Only fetch users if admin status has been verified
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Filter users based on search term and deleted status
  const filteredUsers = users.filter(user => {
    // First check if user matches search criteria
    const matchesSearch = 
      (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // If showDeletedUsers is false, exclude deleted users
    // If showDeletedUsers is true, include all users that match search
    if (!showDeletedUsers && user.isDeleted) {
      return false; // Don't show deleted users when toggle is off
    }
    
    return matchesSearch; // Only show users that match search criteria
  });

  // Count deleted users for the toggle button display
  const deletedUsersCount = users.filter(user => user.isDeleted).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        {isAdmin && (
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        )}
        {!isAdmin && (
          <div className="mt-4 flex items-center justify-center">
            <FiShield className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">Admin privileges required</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center">
            <FiUsers className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">Clients</h2>
          </div>
          <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-xs font-medium">
            {filteredUsers.length}
          </span>
        </div>
        
        {/* Search Box */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Show Deleted Users Toggle */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FiUserX className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Show Deleted Accounts</span>
          </div>
          <button
            onClick={() => {
              console.log('Toggling deleted users display. Current:', showDeletedUsers, 'New:', !showDeletedUsers);
              console.log('Total deleted users in state:', users.filter(user => user.isDeleted).length);
              setShowDeletedUsers(!showDeletedUsers);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              showDeletedUsers 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {showDeletedUsers ? 'Showing' : 'Hidden'} ({deletedUsersCount})
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No clients match your search' : 'No clients found'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 cursor-pointer transition-colors duration-150 ${
                    selectedUser === user.id 
                      ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        user.isDeleted ? 'bg-red-100' : user.role === 'admin' ? 'bg-green-100' : 'bg-indigo-100'
                      }`}>
                        {user.isDeleted 
                          ? <FiUserX className="h-6 w-6 text-red-600" />
                          : user.role === 'admin' 
                            ? <FiShield className="h-6 w-6 text-green-600" /> 
                            : <FiUser className="h-6 w-6 text-indigo-600" />
                        }
                      </div>
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className={`font-medium ${user.isDeleted ? 'text-gray-500' : 'text-gray-900'}`}>
                        {user.lastName ? `${user.lastName}, ${user.firstName}` : user.firstName || user.email || 'Unknown User'}
                      </div>
                      {user.email && <div className="text-sm text-gray-600">{user.email}</div>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.role && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {user.role}
                          </span>
                        )}
                        {user.isDeleted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-3">
        {selectedUser ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('files')}
                  className={`px-6 py-4 text-center w-1/2 font-medium text-sm ${
                    activeTab === 'files'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Client Files
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-4 text-center w-1/2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Client Details
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'files' ? (
                <AdminUserFiles userId={selectedUser} />
              ) : (
                <AdminUserDetails userId={selectedUser} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Client</h3>
            <p className="text-gray-500">Select a client from the list to view their information and files</p>
          </div>
        )}
      </div>
    </div>
  );
}