import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--surface-0)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        <main className="flex-1 p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
