import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

import Layout from '../Layout';
import AddSaleModal from './AddSaleModal';

const Sales = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchInventory();
    fetchSales();
  }, []);

  useEffect(() => {
    filterSalesByMonth();
  }, [sales, currentDate]);

  const fetchInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching inventory:", error.message);
    } else {
      setInventory(data);
      console.log('Fetched inventory:', data);
    }
  };

  const fetchSales = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching sales:", error.message);
    } else {
      setSales(data);
      console.log('Fetched sales:', data);
    }
  };

  const filterSalesByMonth = () => {
    const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const year = currentDate.getFullYear();

    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
    });
    setFilteredSales(filtered);
  };

  const handleAddSale = async (sale) => {
    console.log('Attempting to add sale...');

    const { data: { user } } = await supabase.auth.getUser();

    const itemInInventory = inventory.find(item => item.id.toString() === sale.selectedItemId.toString());

    if (!itemInInventory) {
      console.error('Selected item not found in inventory.');
      return;
    }

    const calculatedProfit = sale.priceSold - (itemInInventory.price * sale.quantity);

    const { error } = await supabase
      .from('sales')
      .insert([{
        user_id: user.id,
        inventory_item_id: itemInInventory.id,
        product_name: itemInInventory.product_name,
        brand: itemInInventory.brand,
        size: itemInInventory.size,
        quantity_sold: sale.quantity,
        price_sold: sale.priceSold,
        sale_date: sale.saleDate,
        profit: calculatedProfit
      }]);

    if (error) {
      console.error('Error adding sale:', error.message);
    } else {
      if (itemInInventory.quantity - sale.quantity <= 0) {
        await supabase
          .from('inventory')
          .delete()
          .eq('id', itemInInventory.id);
      } else {
        await supabase
          .from('inventory')
          .update({ quantity: itemInInventory.quantity - sale.quantity })
          .eq('id', itemInInventory.id);
      }

      fetchSales();
      fetchInventory();
      setIsModalOpen(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId);

    if (error) {
      console.error('Error deleting sale:', error.message);
    } else {
      fetchSales();
    }
  };

  const openAddSaleModal = () => {
    setIsModalOpen(true);
  };

  const closeAddSaleModal = () => {
    setIsModalOpen(false);
  };

  const calculateTotalSalesValue = () => {
    return filteredSales.reduce((total, sale) => total + sale.price_sold, 0);
  };

  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    setCurrentDate(new Date(previousMonth));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    setCurrentDate(new Date(nextMonth));
  };

  return (
    <Layout>
      <div className="relative ">
        <h2 className="text-3xl  text-violet-300 font-bold mb-8">Sales</h2>
        
        <div className="flex justify-around items-center mb-4">
          <div>
          <button
            onClick={openAddSaleModal}
            className="bg-violet-500 text-white py-2 px-4 rounded-3xl hover:bg-violet-600 transition-colors"
          >
            Add New Sale
            </button>
          </div>

          <div className="flex items-center space-x-4 ">
          <button
            onClick={handlePreviousMonth}
            className="bg-gray-500 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14.5 17L9.5 12L14.5 7" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
            <span className="text-violet-200 font-bold">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="bg-gray-500 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path xmlns="http://www.w3.org/2000/svg" d="M9.5 7L14.5 12L9.5 17" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </button>
            </div>
            <div className="text-violet-200">
              <p>Total Sales This Month: <span className="font-bold">£{calculateTotalSalesValue()}</span></p>
            </div>
          
        </div>

        <div className="relative overflow-x-auto rounded-xl bg-zinc-800 border border-zinc-700">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-800 text-zinc-400">
              <tr className="border-b border-zinc-700">
                <th scope="col" className="px-6 py-3">Product Name</th>
                <th scope="col" className="px-6 py-3">Quantity Sold</th>
                <th scope="col" className="px-6 py-3">Price Sold</th>
                <th scope="col" className="px-6 py-3">Profit</th>
                <th scope="col" className="px-6 py-3">Date Sold</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="border-b border-zinc-700">
                    <td className="px-6 py-4">{sale.product_name}</td>
                    <td className="px-6 py-4">{sale.quantity_sold}</td>
                    <td className="px-6 py-4">£{sale.price_sold}</td>
                    <td className="px-6 py-4">£{sale.profit.toFixed(2)}</td>
                    <td className="px-6 py-4">{sale.sale_date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan="6">
                    No Sales Made This Month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
              
          
        </div>

        <div className="relative">
          <AddSaleModal
            isOpen={isModalOpen}
            onClose={closeAddSaleModal}
            onAddSale={handleAddSale}
            inventory={inventory}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
