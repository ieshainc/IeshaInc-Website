"use client";
import AdminRoute from '../components/AdminRoute';
import AdminUserList from '../components/AdminUserList';
import { FiUsers, FiShield } from 'react-icons/fi';

export default function AdminPortal() {
  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <FiShield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            Manage client accounts, view documents, and maintain secure access.
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div className="flex items-center space-x-2">
              <FiUsers className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Client Management</h2>
            </div>
            <p className="mt-1 text-sm text-indigo-100">
              View and manage all client information and documents in one place.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <AdminUserList />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}