'use client';

import React, { useState } from 'react';
import { documentTypes, DocumentTypeEnum } from '../../utils/documentTypes';

interface DocTypeSelectorProps {
  onChange: (value: string) => void;
  selectedType?: string;
}

export default function DocTypeSelector({ onChange, selectedType }: DocTypeSelectorProps) {
  const [selectedDocType, setSelectedDocType] = useState<string>(selectedType || '');
  const [customDocType, setCustomDocType] = useState<string>('');

  // Handle radio button selection
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDocType(value);

    if (value !== DocumentTypeEnum.OTHER) {
      setCustomDocType('');
      onChange(value);
    } else {
      onChange(''); // Reset until user types custom value
    }
  };

  // Handle custom document type input
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDocType(value);
    onChange(value);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Document Type <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
        {documentTypes.map((docType) => (
          <label key={docType.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="radio"
              name="docType"
              value={docType.label}
              checked={selectedDocType === docType.label}
              onChange={handleRadioChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <div>
              <span className="text-sm font-medium text-gray-900" title={docType.description}>
                {docType.label}
              </span>
              {selectedDocType === docType.label && docType.description && (
                <p className="mt-1 text-xs text-gray-500">{docType.description}</p>
              )}
            </div>
          </label>
        ))}

        {/* "Other" Option */}
        <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer border-t border-gray-200">
          <input
            type="radio"
            name="docType"
            value={DocumentTypeEnum.OTHER}
            checked={selectedDocType === DocumentTypeEnum.OTHER}
            onChange={handleRadioChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm font-medium text-gray-900">Other (specify)</span>
        </label>

        {/* If "Other" is selected, show custom input */}
        {selectedDocType === DocumentTypeEnum.OTHER && (
          <div className="ml-7 mt-2">
            <input
              type="text"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Specify document type"
              value={customDocType}
              onChange={handleCustomChange}
              autoFocus
            />
          </div>
        )}
      </div>
      {selectedDocType === DocumentTypeEnum.OTHER && !customDocType && (
        <p className="mt-1 text-xs text-red-500">Please specify a document type.</p>
      )}
    </div>
  );
} 