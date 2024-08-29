import React from 'react';
import Sidebar from './Sidebar'; // Adjust the import path according to your project structure
import Navbar from './Navbar';   // Import the Navbar component

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar /> 
      <div className="flex">        
          <Sidebar />       
        <div className="flex-1  p-6">
          <div className="max-w-7xl ml-96 mt-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
