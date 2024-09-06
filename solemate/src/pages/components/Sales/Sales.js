import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button as NextUIButton, Spinner } from "@nextui-org/react";
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../Layout';
import AddSaleModal from './AddSaleModal';


const Sales = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchSales();
  }, []);

  useEffect(() => {
    filterSalesByMonth();
  }, [sales, currentDate]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('inventory').select('*').eq('user_id', user.id);

    if (error) {
      setError(error.message);
    } else {
      setInventory(data);
    }
    setLoading(false); // Set loading to false after fetching data
  };

  const fetchSales = async () => {
    setLoading(true); // Set loading to true before fetching data
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('sales').select('*').eq('user_id', user.id);

    if (error) {
      setError(error.message);
    } else {
      setSales(data);
    }
    setLoading(false); // Set loading to false after fetching data
  };

  const filterSalesByMonth = () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
    });
    setFilteredSales(filtered);
  };

  const handleAddSale = async (sale) => {
    const { data: { user } } = await supabase.auth.getUser();
    const itemInInventory = inventory.find(item => item.id.toString() === sale.selectedItemId.toString());

    if (!itemInInventory) {
      console.error('Selected item not found in inventory.');
      return;
    }

    const calculatedProfit = sale.priceSold - (itemInInventory.price * sale.quantity);
    const { error } = await supabase.from('sales').insert([{
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
        await supabase.from('inventory').delete().eq('id', itemInInventory.id);
      } else {
        await supabase.from('inventory').update({ quantity: itemInInventory.quantity - sale.quantity }).eq('id', itemInInventory.id);
      }
      fetchSales();
      fetchInventory();
      setIsModalOpen(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    const { error } = await supabase.from('sales').delete().eq('id', saleId);

    if (error) {
      console.error('Error deleting sale:', error.message);
    } else {
      fetchSales();
    }
  };

  const openAddSaleModal = () => setIsModalOpen(true);
  const closeAddSaleModal = () => setIsModalOpen(false);

  const calculateTotalSalesValue = () => filteredSales.reduce((total, sale) => total + sale.price_sold, 0);

  const handlePreviousMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const classNames = {
    base: "w-full relative",  
    wrapper: "p-4 bg-zinc-800",  
    table: "min-w-full auto", 
    th: "px-6 py-3 bg-zinc-700 text-zinc-400 text-left",
    td: "px-6 py-4 text-zinc-400",
    row: "bg-zinc-800 last:border-none",
    buttonEdit: "bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors mr-2",
    buttonDelete: "bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors",
  };

  return (
    <Layout>
      <div className="relative">
        <h2 className="text-3xl text-violet-300 font-bold mb-8">Sales</h2>

        <div className="flex justify-between items-center mb-4">
          <NextUIButton
            onPress={openAddSaleModal}
            className="bg-violet-500 text-white py-2 px-4 rounded-3xl hover:bg-violet-600 transition-colors"
          >
            Add New Sale
          </NextUIButton>

          <div className="flex items-center space-x-4">
            <NextUIButton
              onPress={handlePreviousMonth}
              className="bg-gray-500 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-600 transition-colors"
            >
              &lt;
            </NextUIButton>
            <span className="text-violet-200 font-bold">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </span>
            <NextUIButton
              onPress={handleNextMonth}
              className="bg-gray-500 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-600 transition-colors"
            >
              &gt;
            </NextUIButton>
          </div>

          <div className="text-violet-200">
            <p>Total Sales This Month: <span className="font-bold">£{calculateTotalSalesValue()}</span></p>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner size="md" color='white'  />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center text-violet-200 mb-4">
            No Sales Made This Month.
          </div>
        ) : (
          <Table
            aria-label="Sales Table"
            selectionMode="none"
            classNames={classNames}
          >
            <TableHeader>
              <TableColumn className={classNames.th}>Product Name</TableColumn>
              <TableColumn className={classNames.th}>Quantity Sold</TableColumn>
              <TableColumn className={classNames.th}>Price Sold</TableColumn>
              <TableColumn className={classNames.th}>Profit</TableColumn>
              <TableColumn className={classNames.th}>Date Sold</TableColumn>
              <TableColumn className={classNames.th}>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} className={classNames.row}>
                  <TableCell className={classNames.td}>{sale.product_name}</TableCell>
                  <TableCell className={classNames.td}>{sale.quantity_sold}</TableCell>
                  <TableCell className={classNames.td}>£{sale.price_sold}</TableCell>
                  <TableCell className={classNames.td}>{sale.profit ? sale.profit.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell className={classNames.td}>
                    {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className={classNames.td}>
                    <NextUIButton
                      onPress={() => handleDeleteSale(sale.id)}
                      className={classNames.buttonDelete}
                    >
                      Delete
                    </NextUIButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <AddSaleModal
          isOpen={isModalOpen}
          onClose={closeAddSaleModal}
          onAddSale={handleAddSale}
          inventory={inventory}
        />
      </div>
    </Layout>
  );
};

export default Sales;
