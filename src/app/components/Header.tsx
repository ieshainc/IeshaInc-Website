'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import AuthStateListener from './AuthStateListener';
import UserProfileModal from './UserProfileModal';

export default function Header() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-indigo-600">YourSite</div>
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-gray-900 hover:text-gray-600 ${
                pathname === '/' ? 'font-medium' : ''
              }`}
            >
              Home
            </Link>
            {/* Add more navigation links as needed */}
            
            {currentUser && (
              <Link 
                href="/profile" 
                className={`text-gray-900 hover:text-gray-600 ${
                  pathname === '/profile' ? 'font-medium' : ''
                }`}
              >
                My Profile
              </Link>
            )}
            
            <AuthStateListener />
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-4">
            <div className="text-xl font-bold text-indigo-600">YourSite</div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 p-2"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="bg-white py-4 space-y-4">
              <Link 
                href="/" 
                className={`block px-4 py-2 text-gray-900 hover:bg-gray-100 ${
                  pathname === '/' ? 'font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {/* Add more navigation links as needed */}
              
              {currentUser && (
                <Link 
                  href="/profile" 
                  className={`block px-4 py-2 text-gray-900 hover:bg-gray-100 ${
                    pathname === '/profile' ? 'font-medium' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}
              
              <div className="px-4 py-2">
                <AuthStateListener isMobile={true} />
              </div>
            </nav>
          )}
        </div>
      </div>
      <UserProfileModal />
    </header>
  );
} 