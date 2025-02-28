"use client";
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import AdminUserFiles from './AdminUserFiles';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminUserList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const userData: UserData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userData.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
          });
        });
        
        // Sort users by last name, then first name
        setUsers(userData.sort((a, b) => 
          `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
        ));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-4">Loading users...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Clients</h2>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded cursor-pointer ${
                  selectedUser === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(user.id)}
              >
                <div className="font-medium">
                  {user.lastName}, {user.firstName}
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        {selectedUser ? (
          <AdminUserFiles userId={selectedUser} />
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <p>Select a client to view their files</p>
          </div>
        )}
      </div>
    </div>
  );
} 