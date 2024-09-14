import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = () => {
  const [state, setState] = useState({
    left: false,
  });

 
  const [clicked, setClicked] = useState(false);


  const [hovered, setHovered] = useState(false);

  
  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setClicked(open); 
    setState({ ...state, [anchor]: open });
  };

  
  const handleMouseEnter = () => {
    if (!clicked) {
      setHovered(true);
      setState({ ...state, left: true }); 
    }
  };


  const handleMouseLeave = () => {
    if (!clicked) {
      setHovered(false);
      setState({ ...state, left: false }); 
    }
  };

  const list = (anchor) => (
    <div
      className="w-64 bg-[#111113] h-full text-white"
      role="presentation"
      onClick={toggleDrawer(anchor, true)}
      onKeyDown={toggleDrawer(anchor, true)}
    >
      <ul className=" mt-8">
        {/* Dashboard Link */}
        <li className="border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center p-4 hover:bg-[#18181b]">
            <HomeIcon className="text-gray-400" />
            <span className="ml-3 text-gray-300">Dashboard</span>
          </Link>
        </li>

        {/* Sales Link */}
        <li className="border-b border-gray-700">
          <Link href="/sales" className="flex items-center p-4 hover:bg-[#18181b]">
            <ShoppingCartIcon className="text-gray-400" />
            <span className="ml-3 text-gray-300">Sales</span>
          </Link>
        </li>

        {/* Inventory Link */}
        <li className="border-b border-gray-700">
          <Link href="/inventory" className="flex items-center p-4 hover:bg-[#18181b]">
            <InventoryIcon className="text-gray-400" />
            <span className="ml-3 text-gray-300">Inventory</span>
          </Link>
        </li>

        {/* Sign Out Link */}
        <li className="border-b border-gray-700">
          <Link href="/logout" className="flex items-center p-4 hover:bg-[#18181b]">
            <LogoutIcon className="text-gray-400" />
            <span className="ml-3 text-gray-300">Sign Out</span>
          </Link>
        </li>
      </ul>
    </div>
  );
  
    return (
      <div className='bg-[#111113] w-12 border-r border-zinc-500 '> {/* Using custom color */}
        {/* Menu Button */}
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={toggleDrawer('left', true)}
          className="text-white ml-1"
        >
          <MenuIcon className=' text-zinc-400' />
        </IconButton>
  
        {/* Drawer Component */}
        <Drawer
          anchor="left"
          open={state.left}
          onClose={toggleDrawer('left', false)}
        >
          {list('left')}
        </Drawer>
      </div>
    );
  };
  
  export default Sidebar;
  
