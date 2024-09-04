import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-500 fixed top-0 z-40">
      <div className="px-4 py-3 flex justify-end">
        <h2 className="text-4xl font-extrabold text-violet-300 tracking-wider">
          SoleMate
        </h2>
      </div>
    </nav>
  );
};

export default Navbar;
