"use client";
import AdminRoute from '../components/AdminRoute';
import AdminUserList from '../components/AdminUserList';

export default function AdminPortal() {
  return (
    <AdminRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
        <p className="text-gray-600 mb-6">
          Welcome to the Admin Portal. Here you can manage all clients and their documents.
        </p>
        <AdminUserList />
      </div>
    </AdminRoute>
  );
} 