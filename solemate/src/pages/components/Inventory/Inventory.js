import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button as NextUIButton, Spinner } from "@nextui-org/react";
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../Layout';
import AddItemModal from './AddItemModal';

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
    setLoading(true); // Set loading to true before fetching
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false); // Set loading to false on error
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

    setLoading(false); // Set loading to false after fetching
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

  const classNames = {
    base: "w-full relative",  
    wrapper: "p-4 bg-zinc-800",  
    table: "min-w-full auto", 
    th: "px-6 py-3 bg-zinc-700 text-zinc-400 text-left font-bold",
    td: "px-6 py-4 text-zinc-400",
    row: "bg-zinc-800 last:border-none",
    img: "w-16 h-16 object-cover rounded-md",
    buttonEdit: "bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors mr-2",
    buttonDelete: "bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors",
  };

  return (
    <Layout>
      <div className="relative">
        <h2 className="text-3xl text-violet-300 font-bold mb-8">Inventory</h2>

        <div className="flex justify-between items-center mb-4">
          <NextUIButton
            onPress={() => setIsModalOpen(true)}
            className="bg-violet-500 text-white py-2 px-4 rounded-3xl hover:bg-violet-600 transition-colors"
          >
            Add New Item
          </NextUIButton>
          <div className="text-violet-200">
            <p>Total Stock Value: <span className="font-bold">£{calculateTotalStockValue()}</span></p>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner size="md" color='white' />
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center text-violet-200 mb-4">
            No items in inventory.
          </div>
        ) : (
          <Table
            aria-label="Inventory Table"
            selectionMode="none"
            classNames={classNames}
          >
            <TableHeader>
              <TableColumn className={classNames.th}>Product Name</TableColumn>
              <TableColumn className={classNames.th}>Brand</TableColumn>
              <TableColumn className={classNames.th}>Size</TableColumn>
              <TableColumn className={classNames.th}>Quantity</TableColumn>
              <TableColumn className={classNames.th}>Price</TableColumn>
              <TableColumn className={classNames.th}>Image</TableColumn>
              <TableColumn className={classNames.th}>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className={classNames.row}>
                  <TableCell className={classNames.td}>{item.product_name}</TableCell>
                  <TableCell className={classNames.td}>{item.brand}</TableCell>
                  <TableCell className={classNames.td}>{item.size}</TableCell>
                  <TableCell className={classNames.td}>{item.quantity}</TableCell>
                  <TableCell className={classNames.td}>£{item.price}</TableCell>
                  <TableCell className={classNames.td}>
                    <img
                      src={item.image_url || placeholderImageUrl}
                      alt={item.product_name}
                      className={classNames.img}
                    />
                  </TableCell>
                  <TableCell className={classNames.td}>
                    <NextUIButton
                      onPress={() => openEditModal(item)}
                      className={classNames.buttonEdit}
                    >
                      Edit
                    </NextUIButton>
                    <NextUIButton
                      onPress={() => deleteInventoryItem(item.id)}
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
      </div>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={addOrUpdateInventoryItem}
        item={selectedItem}
      />
    </Layout>
  );
};

export default Inventory;
