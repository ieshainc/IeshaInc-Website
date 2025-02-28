"use client";
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { FiFile, FiFileText, FiSearch, FiAlertCircle } from 'react-icons/fi';

interface FileData {
  id: string;
  fileName: string;
  downloadURL: string;
  docType: string;
  createdAt: Date;
  fileSize?: string;
}

export default function AdminUserFiles({ userId }: { userId: string }) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get document icon based on document type
  const getDocumentIcon = (docType: string) => {
    // Different icons based on document type
    if (docType.includes('1099') || docType.includes('W-2') || docType === 'SSA-1099' || docType.includes('1095')) {
      return <FiFileText className="h-6 w-6 text-indigo-500" />;
    }
    
    // Default icon
    return <FiFile className="h-6 w-6 text-gray-500" />;
  };

  useEffect(() => {
    // Reset state when userId changes
    setLoading(true);
    setError(null);
    setFiles([]);

    // Fetch user email for display purposes
    const fetchUserEmail = async () => {
      try {
        const userDoc = await getDocs(collection(db, 'users'));
        const user = userDoc.docs.find(doc => doc.id === userId);
        if (user && user.data().email) {
          setUserEmail(user.data().email);
        }
      } catch (err) {
        console.error('Error fetching user email:', err);
      }
    };
    
    fetchUserEmail();

    let unsubscribeCentral: (() => void) | null = null;
    let unsubscribeUser: (() => void) | null = null;

    const fetchFiles = async () => {
      try {
        // Try first looking in the centralized documents collection with userId field
        console.log('Fetching files for user:', userId);
        const centralDocsRef = collection(db, 'documents');
        const centralQuery = query(
          centralDocsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        // Set up subscription to central documents
        unsubscribeCentral = onSnapshot(centralQuery, (snapshot) => {
          // If we got documents from central collection, use those
          if (!snapshot.empty) {
            console.log('Found files in central documents collection:', snapshot.size);
            const fileData: FileData[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              fileData.push({
                id: doc.id,
                fileName: data.fileName || 'Unnamed File',
                downloadURL: data.downloadURL || '',
                docType: data.docType || 'Unknown',
                createdAt: data.createdAt?.toDate() || new Date(),
                fileSize: data.fileSize || '',
              });
            });
            setFiles(fileData);
            setLoading(false);
            return;
          } else {
            console.log('No files found in central documents collection, trying user files subcollection');
          }
          
          // If central collection had no documents, try the subcollection approach
          try {
            const userFilesRef = collection(db, 'users', userId, 'files');
            const userFilesQuery = query(userFilesRef, orderBy('createdAt', 'desc'));
            
            unsubscribeUser = onSnapshot(userFilesQuery, (filesSnapshot) => {
              console.log('Files subcollection query result:', filesSnapshot.size, 'files found');
              const fileData: FileData[] = [];
              filesSnapshot.forEach((doc) => {
                const data = doc.data();
                fileData.push({
                  id: doc.id,
                  fileName: data.fileName || 'Unnamed File',
                  downloadURL: data.downloadURL || '',
                  docType: data.docType || 'Unknown',
                  createdAt: data.createdAt?.toDate() || new Date(),
                  fileSize: data.fileSize || '',
                });
              });
              setFiles(fileData);
              setLoading(false);
            }, (err) => {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              console.error('Error in user files subscription:', err);
              setError(`Failed to load user files: ${errorMessage}. This could be a permissions issue.`);
              setLoading(false);
            });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error setting up user files subscription:', err);
            setError(`Failed to access user files: ${errorMessage}. This could be due to insufficient permissions.`);
            setLoading(false);
          }
        }, (err) => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('Error in central files subscription:', err);
          setError(`Failed to load documents: ${errorMessage}. This could be due to insufficient permissions.`);
          setLoading(false);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error setting up central files subscription:', err);
        setError(`Failed to set up document subscription: ${errorMessage}. Please check your connection and permissions.`);
        setLoading(false);
      }
    };

    fetchFiles();

    return () => {
      if (unsubscribeCentral) unsubscribeCentral();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [userId]);

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    (file.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.docType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        
        <div className="mt-4 text-sm text-red-600">
          <p>This could be due to permission issues accessing the user&apos;s files.</p>
          <p>Make sure you have deployed the updated Firestore rules.</p>
        </div>
        
        <div className="mt-4 flex flex-col items-center space-y-2">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
          
          <button
            onClick={() => {
              // Run the deploy command instruction in the console
              console.log("Please run this command to deploy the updated Firestore rules:");
              console.log("firebase deploy --only firestore:rules");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Show Deploy Command
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">No files uploaded for this client</p>
        {userEmail && (
          <p className="text-sm text-gray-400 mt-1">User: {userEmail}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            className="pl-10 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No files match your search criteria</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">File Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Uploaded</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getDocumentIcon(file.docType)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{file.fileName}</div>
                        {file.fileSize && <div className="text-gray-500">{file.fileSize}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{file.docType}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {file.createdAt.toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={file.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                      <a
                        href={file.downloadURL}
                        download
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}