"use client";
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

interface FileData {
  id: string;
  fileName: string;
  downloadURL: string;
  docType: string;
  createdAt: Date;
}

export default function AdminUserFiles({ userId }: { userId: string }) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filesRef = collection(db, 'documents');
    const q = query(
      filesRef, 
      // Use the consistent document structure from your existing code
      // Assuming documents are filtered by userId field
      // orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileData: FileData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include documents for the selected user
        if (data.userId === userId) {
          fileData.push({
            id: doc.id,
            fileName: data.fileName || '',
            downloadURL: data.downloadURL || '',
            docType: data.docType || '',
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        }
      });
      setFiles(fileData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) return <div className="p-4">Loading files...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-semibold mb-4">Client Files</h3>
      {files.length === 0 ? (
        <p>No files uploaded yet</p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <a 
                    href={file.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {file.fileName}
                  </a>
                  <div className="text-sm text-gray-600">
                    Type: {file.docType}
                  </div>
                  <div className="text-sm text-gray-500">
                    Uploaded: {file.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={file.downloadURL}
                  download
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 