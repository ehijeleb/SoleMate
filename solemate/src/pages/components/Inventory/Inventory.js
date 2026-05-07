import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../Layout';
import AddItemModal from './AddItemModal';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

const CATEGORY_META = {
  shoes:         { label: 'Sneakers',      emoji: '👟', color: '#8b5cf6' },
  clothing:      { label: 'Streetwear',    emoji: '👕', color: '#38bdf8' },
  pokemon:       { label: 'Pokémon Cards', emoji: '🃏', color: '#f59e0b' },
  sports_cards:  { label: 'Sports Cards',  emoji: '⚾', color: '#10b981' },
  trading_cards: { label: 'Trading Cards', emoji: '🎴', color: '#f472b6' },
  collectibles:  { label: 'Collectibles',  emoji: '🏆', color: '#fb923c' },
  luxury:        { label: 'Luxury',        emoji: '💎', color: '#818cf8' },
  electronics:   { label: 'Electronics',   emoji: '📱', color: '#a3e635' },
};

const getCatMeta = (type) => CATEGORY_META[type] || { label: type || 'Unknown', emoji: '📦', color: '#64748b' };

const CategoryBadge = ({ type }) => {
  const { label, emoji, color } = getCatMeta(type);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
    >
      {emoji} {label}
    </span>
  );
};

const SizeLabel = ({ type, size }) => {
  if (!size && size !== 0) return <span style={{ color: '#475569' }}>—</span>;
  if (type === 'pokemon' || type === 'sports_cards' || type === 'trading_cards') {
    return <span style={{ color: '#94a3b8' }}>Grade {size}</span>;
  }
  return <span style={{ color: '#94a3b8' }}>{size}</span>;
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchInventory(); }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFiltered(inventory);
    } else {
      setFiltered(inventory.filter((i) => i.item_type === activeFilter));
    }
  }, [inventory, activeFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('inventory').select('*').eq('user_id', user.id);
    setInventory(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `shoe-images/${fileName}`;
    const { error } = await supabase.storage.from('shoe-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (error) return '';
    const { data } = supabase.storage.from('shoe-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addOrUpdateItem = async (item) => {
    const imageUrl = item.image_file ? await handleImageUpload(item.image_file) : item.image_url || '';
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      product_name: item.product_name,
      brand: item.brand,
      item_type: item.item_type,
      size: item.size ? parseFloat(item.size) : null,
      quantity: item.quantity ? parseInt(item.quantity, 10) : 1,
      price: item.price ? parseFloat(item.price) : null,
      image_url: imageUrl,
    };

    if (item.id) {
      await supabase.from('inventory').update(payload).eq('id', item.id).eq('user_id', user.id);
      await supabase.from('shoe_log').update(payload).eq('id', item.id).eq('user_id', user.id);
    } else {
      const { data: inserted } = await supabase
        .from('inventory')
        .insert([{ user_id: user.id, ...payload }])
        .select();
      if (inserted?.[0]) {
        await supabase.from('shoe_log').insert([{
          id: inserted[0].id,
          user_id: user.id,
          ...payload,
          is_sold: false,
          date_added: new Date(),
        }]);
      }
    }

    fetchInventory();
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const deleteItem = async (itemId) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('inventory').delete().eq('id', itemId).eq('user_id', user.id);
    await supabase.from('shoe_log').update({ is_sold: true, date_removed: new Date() }).eq('id', itemId).eq('user_id', user.id);
    setDeleteConfirm(null);
    fetchInventory();
  };

  const totalValue = inventory.reduce((t, i) => t + (i.price || 0) * (i.quantity || 0), 0);
  const categories = [...new Set(inventory.map((i) => i.item_type).filter(Boolean))];

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {inventory.length} listings · Stock value:{' '}
            <span style={{ color: '#a78bfa' }}>£{totalValue.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            className={`category-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({inventory.length})
          </button>
          {categories.map((cat) => {
            const { label, emoji } = getCatMeta(cat);
            const count = inventory.filter((i) => i.item_type === cat).length;
            return (
              <button
                key={cat}
                className={`category-chip ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {emoji} {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <Package size={36} style={{ color: '#334155', marginBottom: '12px' }} />
          <p className="font-medium" style={{ color: '#475569' }}>No items here yet.</p>
          <p className="text-sm mt-1" style={{ color: '#334155' }}>
            Click &ldquo;Add Item&rdquo; to start building your inventory.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Product', 'Category', 'Brand', 'Size / Grade', 'Qty', 'Cost Price', 'Stock Value', 'Image', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#475569' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    background: idx % 2 === 0 ? 'var(--surface-1)' : 'rgba(255,255,255,0.01)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td className="px-4 py-3 font-medium text-white">{item.product_name}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge type={item.item_type} />
                  </td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{item.brand || '—'}</td>
                  <td className="px-4 py-3">
                    <SizeLabel type={item.item_type} size={item.size} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>
                    £{Number(item.price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#10b981' }}>
                    £{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg"
                        style={{ border: '1px solid var(--border-subtle)' }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: 'var(--surface-2)' }}
                      >
                        {getCatMeta(item.item_type).emoji}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer' }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="px-2 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'var(--surface-2)', color: '#64748b', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
        onAddItem={addOrUpdateItem}
        item={selectedItem}
      />
    </Layout>
  );
};

export default Inventory;
