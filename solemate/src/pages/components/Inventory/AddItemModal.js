import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const AddItemModal = ({ isOpen, onClose, onAddItem, item }) => {
  const initialNewItemState = {
    product_name: '',
    item_type: '',
    item_type_display: '', // To store the capitalized version
    brand: '',
    size: '',
    quantity: '',
    price: '',
    image_file: null,
  };

  const [newItem, setNewItem] = useState(initialNewItemState);

  // Predefined options for the brands
  const brandOptions = {
    shoes: ['Nike', 'Adidas', 'New Balance', 'Air Jordan', 'Yeezy', 'ASICS', 'Other'],
    clothing: ['Nike', 'Fear of God', 'Kith', 'Supreme', 'Sp5der', 'Other'],
    collectibles: ['Funko', 'Lego', 'Hasbro', 'Mattel', 'Sideshow Collectibles', 'Topps', 'Other'],
  };

  useEffect(() => {
    if (item) {
      setNewItem({
        id: item.id,
        product_name: item.product_name || '',
        item_type: item.item_type || '',
        item_type_display: capitalizeFirstLetter(item.item_type || ''),
        brand: item.brand || '',
        size: item.size || '',
        quantity: item.quantity || '',
        price: item.price || '',
        image_url: item.image_url || '',
      });
    }
  }, [item]);

  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSubmit = () => {
    const validatedItem = {
      ...newItem,
      size: newItem.size ? parseFloat(newItem.size) : null,
      quantity: newItem.quantity ? parseInt(newItem.quantity, 10) : null,
      price: newItem.price ? parseFloat(newItem.price) : null,
    };
    onAddItem(validatedItem);
    handleReset();  // Reset form after submission
    onClose();  // Close the modal after adding the item
  };

  const handleReset = () => {
    setNewItem(initialNewItemState);  // Reset newItem state
  };

  const handleTypeChange = (selectedKeys) => {
    const selectedValue = Array.from(selectedKeys).join(", ");
    setNewItem((prevItem) => ({
      ...prevItem,
      item_type: selectedValue.toLowerCase(), // Store lowercase value for brand matching
      item_type_display: capitalizeFirstLetter(selectedValue), // Display capitalized version
      brand: '',
    }));
  };

  const handleBrandChange = (selectedKeys) => {
    const selectedValue = Array.from(selectedKeys).join(", ");
    setNewItem({ ...newItem, brand: selectedValue });
  };

  return (
    
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent className='bg-zinc-800'>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-2xl mb-4 text-white text-center">
                {item ? 'Edit Item' : 'Add New Item'}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Product Name</label>
                  <input
                    type="text"
                    value={newItem.product_name}
                    onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
                    className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white"
                  />
                </div>

                {/* Item Type Dropdown */}
                <div>
                  <label className="text-xs font-medium text-zinc-300">Item Type</label>
                  <Dropdown>
                    <DropdownTrigger>
                      <div
                        className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white cursor-pointer text-left"
                      >
                        {newItem.item_type_display || 'Select Item Type'}
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Item Type"
                      variant="flat"
                      disallowEmptySelection
                      selectionMode="single"
                      onSelectionChange={handleTypeChange}
                    >
                      <DropdownItem key="shoes">Shoes</DropdownItem>
                      <DropdownItem key="clothing">Clothing</DropdownItem>
                      <DropdownItem key="collectibles">Collectibles</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Brand Dropdown - conditional on item type */}
                {newItem.item_type && brandOptions[newItem.item_type] && (
                  <div>
                    <label className="text-xs font-medium text-zinc-300">Brand</label>
                    <Dropdown>
                      <DropdownTrigger>
                        <div
                          className="w-full p-2 border border-zinc-600 bg-zinc-900 rounded-md text-white cursor-pointer text-left"
                        >
                          {newItem.brand || 'Select Brand'}
                        </div>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Brand"
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        onSelectionChange={handleBrandChange}
                      >
                        {brandOptions[newItem.item_type].map((brand) => (
                          <DropdownItem key={brand}>{brand}</DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )}

                {/* Show size input if item type is 'shoes' */}
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
                  <label className="text-xs font-medium text-zinc-300">Price</label>
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
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors">
                {item ? 'Save Changes' : 'Add Item'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal;
