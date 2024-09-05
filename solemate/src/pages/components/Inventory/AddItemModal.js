import React, { useState, useEffect } from 'react';

const AddItemModal = ({ isOpen, onClose, onAddItem, item }) => {
  const [newItem, setNewItem] = useState({
    product_name: '',
    item_type: '',
    brand: '',
    size: '',
    quantity: '',
    price: '',
    image_file: null,
  });

  // Predefined options for the brands
  const brandOptions = {
    shoes: ['Nike', 'Adidas', 'New Balance', 'Air Jordan', 'Yeezy', 'ASICS', 'Other'],
    clothing: ['Nike', 'Fear of God', 'Kith', 'Supreme', 'Sp5der', 'Other'],
    collectibles: ['Funko', 'Lego', 'Hasbro', 'Mattel', 'Sideshow Collectibles', 'Topps', 'Other']
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setNewItem({
        id: item.id,
        product_name: item.product_name || '',
        item_type: item.item_type || '',
        brand: item.brand || '',
        size: item.size || '',
        quantity: item.quantity || '',
        price: item.price || '',
        image_url: item.image_url || '',
      });
    }
  }, [item]);

  const handleSubmit = () => {
    // Ensure numeric fields have a value or are set to null
    const validatedItem = {
      ...newItem,
      size: newItem.size ? parseFloat(newItem.size) : null,
      quantity: newItem.quantity ? parseInt(newItem.quantity, 10) : null,
      price: newItem.price ? parseFloat(newItem.price) : null,
    };
  
    onAddItem(validatedItem);
  };
  

  const handleTypeChange = (e) => {
    setNewItem({ ...newItem, item_type: e.target.value, brand: '' });
  };

  return isOpen ? (
    <div className="relative inset-0 z-10 flex items-center justify-center">
      <div className="relative max-w-md w-full p-8 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg transform -translate-y-1/2 top-1/2">
        <h2 className="text-2xl mb-4 text-white text-center">{item ? 'Edit Item' : 'Add New Item'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium  text-zinc-300">Product Name</label>
            <input
              type="text"
              value={newItem.product_name}
              onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Item Type</label>
            <select
              value={newItem.item_type}
              onChange={handleTypeChange}
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
            >
              <option value="">Select Item Type</option>
              <option value="shoes">Shoes</option>
              <option value="clothing">Clothing</option>
              <option value="collectibles">Collectibles</option>
            </select>
          </div>
          {newItem.item_type && (
            <div>
              <label className="text-xs font-medium text-zinc-300">Brand</label>
              <select
                value={newItem.brand}
                onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              >
                <option value="">Select Brand</option>
                {brandOptions[newItem.item_type].map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          )}
          {newItem.item_type === 'shoes' && (
            <div>
              <label className="text-xs font-medium text-zinc-300">Size</label>
              <input
                type="number"
                value={newItem.size}
                onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-zinc-300">Quantity</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium  text-zinc-300">Price</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Image File</label>
            <input
              type="file"
              onChange={(e) => setNewItem({ ...newItem, image_file: e.target.files[0] })}
              className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
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
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default AddItemModal;
