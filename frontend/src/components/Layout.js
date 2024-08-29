import React from 'react';
import Sidebar from './Sidebar';  // Adjust the import path according to your project structure

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar with an increased width */}
      <div className='w-32' >  {/* Adjust the width as needed */}
        <Sidebar />
      </div>
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
