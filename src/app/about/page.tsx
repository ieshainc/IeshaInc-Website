import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col" style={{ textAlign: 'center', marginTop: '2rem' }}>

      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Welcome to Innovative Economic Solutions & Honest Accounting Inc.
          </h1>

          {/* What We Do Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">What We Do</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-medium mb-2">Tax Preparation Services</h3>
              <p className="text-gray-600">
                A reliable service focused on providing meticulous and reliable tax preparation services 
                to help you navigate through tax season with ease.
              </p>
            </div>
          </section>

          {/* About lesha Inc Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">About lesha Inc</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 mb-4">
                Welcome to lesha Inc—your trusted partner for all tax preparation needs. 
                Our dedicated team is passionate about providing meticulous, reliable, 
                and friendly services to help you navigate each tax season stress-free.
              </p>
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Our Mission</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                Our mission is to empower individuals and businesses with clear, 
                comprehensive tax solutions. We pride ourselves on personalized attention 
                and building long-term relationships with our clients.
              </p>
            </div>
          </section>

          {/* Our History Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Our History</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                Founded in 2025, lesha Inc started as a small tax consultation firm. 
                Over the years, we've expanded to serve clients nationwide, staying 
                committed to our core values of integrity, accuracy, and exceptional 
                customer care.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Contacts</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                <a href="mailto:contact@leshainc.com" className="text-blue-600 hover:text-blue-800">
                  contact@leshainc.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 