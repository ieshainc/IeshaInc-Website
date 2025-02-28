'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  // Initialize with null to prevent hydration mismatch
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  
  // Only set the year after client-side hydration is complete
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="bg-white border-t border-gray-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold text-indigo-600">Iesha Inc.</div>
            <p className="text-sm text-gray-600 mt-1">Innovative Economic Solutions & Honest Accounting Inc.</p>
          </div>
          
          <div className="text-sm text-gray-500">
            &copy; {currentYear || ''} Iesha Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
} 