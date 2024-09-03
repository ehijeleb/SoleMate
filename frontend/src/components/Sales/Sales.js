import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Layout from '../Layout';
import AddSaleModal from './AddSaleModal';

const Sales = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchSales();
  }, []);

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
    return sales.reduce((total, sale) => total + sale.price_sold, 0);
  };

  return (
    <Layout>
      <div className="relative">
        <h2 className="text-3xl text-center text-purple-900 font-bold mb-8">Sales</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={openAddSaleModal}
            className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
          >
            Add New Sale
          </button>
          <div className="text-white">
            <p>Total Sales Value: <span className="font-bold">£{calculateTotalSalesValue()}</span></p>
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
              {sales.length > 0 ? (
                sales.map(sale => (
                  <tr key={sale.id} className="border-b border-zinc-700">
                    <td className="px-6 py-4">{sale.product_name}</td>
                    <td className="px-6 py-4">{sale.quantity_sold}</td>
                    <td className="px-6 py-4">£{sale.price_sold}</td>
                    <td className="px-6 py-4">£{sale.profit}</td>
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
                    No sales made yet.
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
