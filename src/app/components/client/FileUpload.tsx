'use client';

import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, resetUploadState } from '../../store/slices/documentsSlice';
import { AppDispatch, RootState } from '../../store';
import DocTypeSelector from './DocTypeSelector';

export default function FileUpload() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useSelector((state: RootState) => state.user);
  const { currentUpload } = useSelector((state: RootState) => state.documents);
  
  // Helper function to check if upload is in progress
  const isUploading = (): boolean => {
    return !!currentUpload && currentUpload.progress > 0 && !currentUpload.completed;
  };

  // Reset component state
  const resetForm = () => {
    setSelectedFile(null);
    setDocType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    dispatch(resetUploadState());
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Reset any previous upload state
      dispatch(resetUploadState());
    }
  };

  // Handle document type selection
  const handleDocTypeChange = (value: string) => {
    setDocType(value);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !docType || !user.uid) return;

    try {
      await dispatch(uploadDocument({
        userId: user.uid,
        file: selectedFile,
        docType
      })).unwrap();
      
      // Reset form on successful upload (after 1.5s to show completion)
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      // Error is handled in the Redux state
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      
      <div className="space-y-4">
        {/* Document Type Selector */}
        <DocTypeSelector onChange={handleDocTypeChange} selectedType={docType} />
        
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input 
              type="file" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            
            {selectedFile && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-500">
              Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
        
        {/* Upload Button */}
        <div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !docType || isUploading()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading() ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
        
        {/* Progress bar */}
        {currentUpload && currentUpload.progress > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{currentUpload.progress < 100 ? 'Uploading...' : 'Upload complete!'}</span>
              <span>{Math.round(currentUpload.progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${currentUpload.progress < 100 ? 'bg-indigo-500' : 'bg-green-500'}`}
                style={{ width: `${currentUpload.progress}%`, transition: 'width 0.3s ease' }}
              />
            </div>
            
            {currentUpload.completed === true && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Document uploaded successfully!</span>
              </div>
            )}
            
            {currentUpload.error && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{currentUpload.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 