import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, userRole = 'admin' }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header userRole={userRole} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
        
        <footer className="p-4 text-center text-xs text-gray-400 bg-white border-t border-gray-100">
          &copy; 2024 GeoDisease Kabupaten Madiun. Modern Disease Mapping System.
        </footer>
      </div>
    </div>
  );
};

export default Layout;