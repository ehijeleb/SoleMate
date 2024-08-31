import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-500 fixed top-0 z-50">
      <div className="px-4 py-3 flex justify-end">
        <span className="text-3xl font-extrabold text-purple-900 tracking-wider">
          SoleMate
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
