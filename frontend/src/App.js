import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Inventory from './components/Inventory/Inventory';
import Sales from './components/Sales/Sales'
import Dashboard from './components/Dashboard/Dashboard'
import './tailwind.css';


function App() {
  return (
    <Router>
     
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path = "/sales" element={<Sales />} />
        </Routes>
      
    </Router>
  );
}

export default App;
