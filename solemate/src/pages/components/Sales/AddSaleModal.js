import React, { useState, useEffect } from 'react';

const AddSaleModal = ({ isOpen, onClose, onAddSale, inventory }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceSold, setPriceSold] = useState('');
  const [saleDate, setSaleDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Disable scrolling when the modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when the modal is closed
      document.body.style.overflow = '';
    }

    // Cleanup when the component is unmounted or when isOpen changes
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = () => {
    const sale = { selectedItemId, quantity, priceSold, saleDate };
    onAddSale(sale);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form fields when the modal is closed
      setSelectedItemId('');
      setQuantity('');
      setPriceSold('');
      setSaleDate('');
    }
  }, [isOpen]);

  return isOpen ? (
    <div className=" relative inset-0 z-10 flex items-center justify-center">
      <div className="relative max-w-md w-full p-8 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg transform -translate-y-1/2 top-1/2">
        <h2 className="text-2xl mb-4 text-white text-center">Add New Sale</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Select an item</label>
            <select
              className="w-full p-2 mb-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              onChange={(e) => setSelectedItemId(e.target.value)}
              value={selectedItemId}
            >
              <option value="" disabled>Select an item</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.product_name} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Quantity Sold</label>
            <input
              type="number"
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Price Sold</label>
            <input
              type="number"
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              value={priceSold}
              onChange={(e) => setPriceSold(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Sale Date</label>
            <input
              type="date"
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
            >
              Add Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default AddSaleModal;
