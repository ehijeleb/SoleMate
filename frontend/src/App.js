import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Inventory from './components/Inventory/Inventory';
import Layout from './components/Layout';
import Sales from './components/Sales/Sales'
import './tailwind.css';


function App() {
  return (
    <Router>
     
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path = "/sales" element={<Sales />} />
        </Routes>
      
    </Router>
  );
}

export default App;
