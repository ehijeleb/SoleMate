import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Layout from '../Layout';
import AddItemModal from './AddItemModal';  // Adjust the path as necessary

const placeholderImageUrl = 'https://xlotiuomuxsgqzdnaqtu.supabase.co/storage/v1/object/public/shoe-images/shoe-images/istockphoto-1324844476-612x612.jpg';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory(); // Fetch existing inventory items when the component loads
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
      setInventory(data);
    }

    setLoading(false);
  };

  const addOrUpdateInventoryItem = async (item) => {
    // Check if an image file is provided
    const imageUrl = item.image_file
        ? await handleImageUpload(item.image_file)
        : item.image_url || '';

    // Get the currently authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError);
        return;
    }

    if (item.id) {
        // Update the existing item
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
            .eq('user_id', user.id);  // Ensure only the user's own item is updated

        if (error) {
            console.error("Error updating inventory item:", error);
        } else {
            fetchInventory();
        }
    } else {
        // Add a new item
        const { error } = await supabase
            .from('inventory')
            .insert([{
                user_id: user.id,
                product_name: item.product_name,
                brand: item.brand,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image_url: imageUrl,
            }]);

        if (error) {
            console.error("Error adding inventory item:", error);
        } else {
            fetchInventory();
        }
    }

    // Close the modal and clear the selected item
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
      console.error("Error deleting inventory item:", error);
    } else {
      fetchInventory();
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="relative">
      <h2 className="text-3xl text-center text-purple-900 font-bold mb-8">Inventory</h2>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-purple-500 text-white py-2 px-4 rounded-md mb-4 hover:bg-purple-600 transition-colors"
      >
        Add New Item
      </button>

      {loading && <p>Loading...</p>}
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
                <tr
                key={item.id}
                className="border-b bg-zinc-800 border-zinc-700 last:border-none"
                >
                <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                    {item.product_name}
                </th>
                <td className="px-6 py-4">{item.brand}</td>
                <td className="px-6 py-4">{item.size}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">${item.price}</td>
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
