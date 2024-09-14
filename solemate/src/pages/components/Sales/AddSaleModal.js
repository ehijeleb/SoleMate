import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const AddSaleModal = ({ isOpen, onClose, onAddSale, inventory }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceSold, setPriceSold] = useState('');
  const [saleDate, setSaleDate] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedItemId('');
      setQuantity('');
      setPriceSold('');
      setSaleDate('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const sale = { selectedItemId, quantity, priceSold, saleDate };
    onAddSale(sale);
    onClose()
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent className="bg-zinc-800">
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-2xl mb-4 text-white text-center">Add New Sale</h2>
            </ModalHeader>
            <ModalBody>
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
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors">
                Add Sale
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddSaleModal;
