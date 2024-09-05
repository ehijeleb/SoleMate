import React from 'react';
import Sidebar from './Sidebar'; // Drawer-based Sidebar
import Navbar from './Navbar';  // Your Navbar component

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar Drawer */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 min-h-screen bg-zinc-900 relative">
        {/* Navbar */}
        <Navbar />
        
        {/* Page content */}
        <div className="p-4 mt-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
