import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

import Layout from '../Layout';
import AddItemModal from './AddItemModal';

const placeholderImageUrl = 'https://xlotiuomuxsgqzdnaqtu.supabase.co/storage/v1/object/public/shoe-images/shoe-images/istockphoto-1324844476-612x612.jpg';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      setError(error.message);
    } else {
      console.log('Full inventory loaded', data);
      setInventory(data);
    }

    setLoading(false);
  };

  const addOrUpdateInventoryItem = async (item) => {
    const imageUrl = item.image_file
        ? await handleImageUpload(item.image_file)
        : item.image_url || '';

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError);
        return;
    }

    let shoeLogError = null;

    if (item.id) {
        const { error } = await supabase
            .from('inventory')
            .update({
                product_name: item.product_name,
                brand: item.brand,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image_url: imageUrl,
            })
            .eq('id', item.id)
            .eq('user_id', user.id);

        if (error) {
            console.error("Error updating inventory item:", error);
        } else {
            await supabase
              .from('shoe_log')
              .update({
                  product_name: item.product_name,
                  brand: item.brand,
                  size: item.size,
                  quantity: item.quantity,
                  price: item.price,
                  image_url: imageUrl,
              })
              .eq('id', item.id) // Assuming the shoe_log table uses the same id as inventory
              .eq('user_id', user.id)
              .then(({ error }) => {
                shoeLogError = error;
              });
            fetchInventory();
        }
    } else {
        const { data, error } = await supabase
            .from('inventory')
            .insert([{
                user_id: user.id,
                product_name: item.product_name,
                brand: item.brand,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image_url: imageUrl,
            }])
            .select();  // Return the inserted row(s) to get the new id

        if (error) {
            console.error("Error adding inventory item:", error);
        } else {
            const newItem = data[0]; // Assuming a single item is inserted

            await supabase
              .from('shoe_log')
              .insert([{
                  id: newItem.id,  // Use the same ID in shoe_log
                  user_id: user.id,
                  product_name: newItem.product_name,
                  brand: newItem.brand,
                  size: newItem.size,
                  quantity: newItem.quantity,
                  price: newItem.price,
                  image_url: imageUrl,
                  is_sold: false,
                  date_added: new Date(),
              }])
              .then(({ error }) => {
                shoeLogError = error;
              });

            fetchInventory();
        }
    }

    if (shoeLogError) {
      console.error("Error updating shoe log:", shoeLogError);
    }

    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleImageUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `shoe-images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('shoe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        return '';
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('shoe-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;

    } catch (error) {
      console.error("Unexpected error during image upload:", error);
      return '';
    }
  };

  const deleteInventoryItem = async (itemId) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting inventory item:", error.message);
    } else {
      await supabase
        .from('shoe_log')
        .update({
          is_sold: true,
          date_removed: new Date(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id);

      fetchInventory();
    }
};

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const calculateTotalStockValue = () => {
    return inventory.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Layout>
      <div className="relative">
        <h2 className="text-3xl  text-violet-300 font-bold mb-8">Inventory</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-500 text-white py-2 px-4 rounded-3xl hover:bg-violet-600 transition-colors"
          >
            Add New Item
          </button>
          <div className="text-violet-200">
            <p>Total Stock Value: <span className="font-bold">£{calculateTotalStockValue()}</span></p>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="relative overflow-x-auto rounded-xl bg-zinc-800 border border-zinc-700">
            <table className="w-full text-sm text-left rtl:text-right text-zinc-400">
              <thead className="text-xs uppercase bg-zinc-800 text-zinc-400 rounded-t-xl">
                <tr className="border-b border-zinc-700">
                  <th scope="col" className="px-6 py-3">Product Name</th>
                  <th scope="col" className="px-6 py-3">Brand</th>
                  <th scope="col" className="px-6 py-3">Size</th>
                  <th scope="col" className="px-6 py-3">Quantity</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Image</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b bg-zinc-800 border-zinc-700 last:border-none">
                    <th scope="row" className="px-6 py-4 font-medium text-zinc-400 whitespace-nowrap dark:text-white">
                      {item.product_name}
                    </th>
                    <td className="px-6 py-4">{item.brand}</td>
                    <td className="px-6 py-4">{item.size}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">£{item.price}</td>
                    <td className="px-6 py-4">
                      <img
                        src={item.image_url || placeholderImageUrl}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(item.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="relative">
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddItem={addOrUpdateInventoryItem}
          item={selectedItem}
        />
      </div>
    </Layout>
  );
};

export default Inventory;
