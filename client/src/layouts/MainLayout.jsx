import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="grow max-w-9xl w-full mx-auto px-4 sm:px-6 lg:px-25 py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
