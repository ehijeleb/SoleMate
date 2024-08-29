import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full border border-zinc-500 bg-zinc-900 border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
        
        <div></div> {/* This empty div will push the "SoleMate" text to the right */}
        <span className="text-3xl text-center text-purple-900 font-extrabold tracking-wider ">
          SoleMate
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
