'use client';

import React from 'react';
import FileUpload from '../components/client/FileUpload';
import DocumentList from '../components/client/DocumentList';
import RouteGuard from '../components/RouteGuard';

export default function ClientPortalPage() {
  return (
    <RouteGuard requireAuth={true} redirectUnauthenticatedTo='/auth'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="mt-2 text-lg text-gray-600">
            Upload and manage your documents securely in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Upload section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload tax forms, receipts, and other important documents.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <FileUpload />
              </div>
            </div>
          </div>

          {/* Right column - Document list */}
          <div className="lg:col-span-2">
            <DocumentList />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
} 