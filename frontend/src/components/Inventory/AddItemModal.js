import React, { useState, useEffect } from 'react';

const AddItemModal = ({ isOpen, onClose, onAddItem, item }) => {
  const [newItem, setNewItem] = useState({
    product_name: '',
    brand: '',
    size: '',
    quantity: '',
    price: '',
    image_file: null,
  });

  useEffect(() => {
    if (item) {
      setNewItem({
        id: item.id, // Ensure the ID is set
        product_name: item.product_name || '',
        brand: item.brand || '',
        size: item.size || '',
        quantity: item.quantity || '',
        price: item.price || '',
        image_url: item.image_url || '',
      });
    }
  }, [item]);

  const handleSubmit = () => {
    onAddItem(newItem);
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700">
          <h2 className="text-2xl text-zinc-100 mb-4">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newItem.product_name}
              onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
            <input
              type="text"
              placeholder="Brand"
              value={newItem.brand}
              onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
            <input
              type="number"
              placeholder="Size"
              value={newItem.size}
              onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
            <input
              type="file"
              onChange={(e) => setNewItem({ ...newItem, image_file: e.target.files[0] })}
              className="w-full p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md"
            />
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
                {item ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default AddItemModal;
