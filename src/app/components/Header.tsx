'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthStateListener from './AuthStateListener';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.uid;
  // Check if user is admin based on role instead of email
  const isAdmin = isAuthenticated && user.role === 'admin';

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
            {pathname !== '/' && (
              <Link 
                href="/" 
                className="text-gray-900 hover:text-gray-600"
              >
                Home
              </Link>
            )}
            {/* Add more navigation links as needed */}
            
            {isAuthenticated && (
              <>
                {pathname !== '/profile' && (
                  <Link 
                    href="/profile" 
                    className="text-gray-900 hover:text-gray-600"
                  >
                    My Profile
                  </Link>
                )}
                {pathname !== '/client-portal' && (
                  <Link 
                    href="/client-portal" 
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Client Portal
                  </Link>
                )}
                {/* Admin Portal Link - only visible to admin users */}
                {isAdmin && pathname !== '/adminportal' && (
                  <Link 
                    href="/adminportal" 
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Admin Portal
                  </Link>
                )}
                {/* Admin Portal Link - only visible to admin users */}
                {isAdmin && pathname !== '/adminportal' && (
                  <Link 
                    href="/adminportal" 
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Admin Portal
                  </Link>
                )}
              </>
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
              {pathname !== '/' && (
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              )}
              {/* Add more navigation links as needed */}
              
              {isAuthenticated && (
                <>
                  {pathname !== '/profile' && (
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                  )}
                  {pathname !== '/client-portal' && (
                    <Link 
                      href="/client-portal" 
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Client Portal
                    </Link>
                  )}
                  {/* Admin Portal Link - only visible to admin users */}
                  {isAdmin && pathname !== '/adminportal' && (
                    <Link 
                      href="/adminportal" 
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Portal
                    </Link>
                  )}
                  {/* Admin Portal Link - only visible to admin users */}
                  {isAdmin && pathname !== '/adminportal' && (
                    <Link 
                      href="/adminportal" 
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Portal
                    </Link>
                  )}
                </>
              )}
              
              <div className="px-4 py-2">
                <AuthStateListener isMobile={true} />
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
} 