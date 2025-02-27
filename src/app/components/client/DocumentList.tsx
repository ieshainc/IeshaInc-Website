'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserDocuments, deleteDocument } from '../../store/slices/documentsSlice';
import { FiFile, FiFileText } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

// Helper function to get document icon based on document type
const getDocumentIcon = (docType: string) => {
  // Different icons based on document type
  if (docType.includes('1099') || docType.includes('W-2') || docType === 'SSA-1099' || docType.includes('1095')) {
    return <FiFileText className="h-6 w-6 text-indigo-500" />;
  }
  
  // Default icon
  return <FiFile className="h-6 w-6 text-gray-500" />;
};

export default function DocumentList() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const { items: documents, status, error } = useSelector((state: RootState) => state.documents);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.uid) {
      dispatch(fetchUserDocuments(user.uid));
    }
  }, [dispatch, user]);

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.docType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    if (user && user.uid) {
      try {
        // Find the document object by ID
        const documentToDelete = documents.find(doc => doc.id === documentId);
        if (documentToDelete) {
          await dispatch(deleteDocument({ 
            document: documentToDelete
          }));
          setDeleteConfirmId(null);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  // Open document in new tab
  const handleOpenDocument = (url: string) => {
    window.open(url, '_blank');
  };

  // Toggle expanded document view
  const toggleExpand = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  // Toggle delete confirmation
  const toggleDeleteConfirm = (docId: string | null) => {
    setDeleteConfirmId(docId);
  };

  // Format date for display
  const formatDate = (timestamp: Timestamp | Date | string | undefined) => {
    if (!timestamp) return 'Unknown';
    
    // Handle string ISO dates (from Redux store)
    if (typeof timestamp === 'string') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(timestamp));
    }
    
    // Handle Firestore Timestamp objects
    const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render loading state
  if (status === 'loading' && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-3 text-gray-600">Loading documents...</p>
      </div>
    );
  }

  // Render error state
  if (status === 'failed') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error || 'An error occurred while loading your documents. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Your Documents
        </h3>
        <div className="relative">
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            {searchTerm 
              ? 'No documents match your search criteria.' 
              : 'You haven\'t uploaded any documents yet.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredDocuments.map((doc) => (
            <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0 mr-3">
                    {getDocumentIcon(doc.docType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => toggleExpand(doc.id)}
                      className="text-left block w-full focus:outline-none"
                    >
                      <span className="truncate text-sm font-medium text-indigo-600">{doc.fileName}</span>
                      <p className="text-xs text-gray-500">
                        {doc.docType} • Uploaded {doc.createdAt ? formatDate(doc.createdAt) : 'Unknown'}
                      </p>
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenDocument(doc.downloadURL)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    View
                  </button>
                  {deleteConfirmId !== doc.id ? (
                    <button
                      onClick={() => toggleDeleteConfirm(doc.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => toggleDeleteConfirm(null)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {expandedDocId === doc.id && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-xs font-medium text-gray-500">Document Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{doc.docType}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-xs font-medium text-gray-500">File Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{doc.fileName}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-xs font-medium text-gray-500">Uploaded At</dt>
                      <dd className="mt-1 text-sm text-gray-900">{doc.createdAt ? formatDate(doc.createdAt) : 'Unknown'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-gray-500">Actions</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleOpenDocument(doc.downloadURL)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Open Document
                          </button>
                          <a
                            href={doc.downloadURL}
                            download
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Download
                          </a>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {status === 'loading' && documents.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-sm text-gray-500">Refreshing documents...</p>
          </div>
        </div>
      )}
    </div>
  );
} 