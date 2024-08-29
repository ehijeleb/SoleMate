import React from 'react';
import Sidebar from './Sidebar';  // Assuming you have a Sidebar component

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        {children}  {/* This will render the content of the page */}
      </div>
    </div>
  );
};

export default Layout;
