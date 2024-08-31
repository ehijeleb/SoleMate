import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-zinc-900">
        <Navbar />
        <div className="mt-16 ml-64 p-4"> {/* mt-16 ensures there's space for the navbar */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
