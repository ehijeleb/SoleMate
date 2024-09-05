import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-zinc-900 relative">
        <Navbar />
        <div className="mt-16 ml-64 p-4 relative"> 
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
