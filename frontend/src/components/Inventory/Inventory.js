import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const placeholderImageUrl = 'https://xlotiuomuxsgqzdnaqtu.supabase.co/storage/v1/object/public/shoe-images/shoe-images/istockphoto-1324844476-612x612.jpg';
const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({
      product_name: '',
      brand: '',
      size: '',
      quantity: '',
      price: '',
      image_file: null,
    });
    
     
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
    const addInventoryItem = async () => {
        // Upload the image if one is provided and get the URL
        const imageUrl = newItem.image_file
          ? await handleImageUpload(newItem.image_file)
          : '';
      
        // Log the image URL for debugging purposes
        console.log('Image URL:', imageUrl); 
      
        // Get the currently authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
      
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }
      
        // Insert the new inventory item into the database
        const { error } = await supabase
          .from('inventory')
          .insert([
            {
              user_id: user.id, // Assign the current user's ID
              product_name: newItem.product_name,
              brand: newItem.brand,
              size: newItem.size,
              quantity: newItem.quantity,
              price: newItem.price,
              image_url: imageUrl,  // Store the image URL
            },
          ]);
      
        // Check if there was an error adding the item
        if (error) {
          console.error("Error adding inventory item:", error);
        } else {
          // Refresh the inventory list after adding
          fetchInventory();  
          // Clear the form inputs
          setNewItem({
            product_name: '',
            brand: '',
            size: '',
            quantity: '',
            price: '',
            image_file: null,
          });
        }
      };
      
      const handleImageUpload = async (file) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `shoe-images/${fileName}`;
      

          // Upload the image to Supabase storage bucket
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
      
          console.log('Upload data:', uploadData);
      
          // Get the public URL for the uploaded image
          const { data: publicUrlData } = supabase
            .storage
            .from('shoe-images')
            .getPublicUrl(filePath);
      
          console.log('Public URL:', publicUrlData.publicUrl);
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
      .eq('user_id', user.id);  // Ensuring that only the item's owner can delete it
  
    if (error) {
      console.error("Error deleting inventory item:", error);
    } else {
      fetchInventory();  // Refresh the inventory list after deletion
    }
  };
  

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-3xl text-center text-purple-900 font-bold mb-8">Inventory</h2>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newItem.product_name}
            onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Brand"
            value={newItem.brand}
            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Size"
            value={newItem.size}
            onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="file"
            onChange={(e) => setNewItem({ ...newItem, image_file: e.target.files[0] })}
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={addInventoryItem}
            className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Brand</th>
                <th className="py-2 px-4 border-b">Size</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Image</th>
              </tr>
            </thead>
            <tbody>
                {inventory.map(item => (
                    <tr key={item.id}>
                    <td className="py-2 px-4 border-b">{item.product_name}</td>
                    <td className="py-2 px-4 border-b">{item.brand}</td>
                    <td className="py-2 px-4 border-b">{item.size}</td>
                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                    <td className="py-2 px-4 border-b">${item.price}</td>
                    <td className="py-2 px-4 border-b">
                        <img 
                        src={item.image_url || placeholderImageUrl} 
                        alt={item.product_name} 
                        className="w-16 h-16 object-cover rounded-md" 
                        />
                    </td>
                    <td className="py-2 px-4 border-b">
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
  );
};

export default Inventory;
