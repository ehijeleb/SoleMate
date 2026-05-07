import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const CATEGORIES = [
  { key: 'shoes',         label: 'Sneakers',       emoji: '👟' },
  { key: 'clothing',      label: 'Streetwear',      emoji: '👕' },
  { key: 'pokemon',       label: 'Pokémon Cards',   emoji: '🃏' },
  { key: 'sports_cards',  label: 'Sports Cards',    emoji: '⚾' },
  { key: 'trading_cards', label: 'Trading Cards',   emoji: '🎴' },
  { key: 'collectibles',  label: 'Collectibles',    emoji: '🏆' },
  { key: 'luxury',        label: 'Luxury',          emoji: '💎' },
  { key: 'electronics',   label: 'Electronics',     emoji: '📱' },
];

const BRANDS = {
  shoes:         ['Nike', 'Adidas', 'New Balance', 'Air Jordan', 'Yeezy', 'ASICS', 'Puma', 'Reebok', 'Salehe Bembury', 'Other'],
  clothing:      ['Supreme', 'Kith', 'Fear of God', 'Sp5der', 'Stüssy', 'Off-White', 'Palace', 'BAPE', 'Corteiz', 'Other'],
  pokemon:       ['PSA', 'BGS', 'CGC', 'ACE', 'Raw / Ungraded'],
  sports_cards:  ['PSA', 'BGS', 'SGC', 'CSG', 'Raw / Ungraded'],
  trading_cards: ['PSA', 'BGS', 'CGC', 'Raw / Ungraded'],
  collectibles:  ['Funko', 'Lego', 'Hot Wheels', 'Bearbrick', 'KAWS', 'Medicom', 'Other'],
  luxury:        ['Rolex', 'Louis Vuitton', 'Chanel', 'Gucci', 'Hermès', 'Cartier', 'Prada', 'Other'],
  electronics:   ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'Nintendo', 'Other'],
};

const CARD_CATEGORIES = ['pokemon', 'sports_cards', 'trading_cards'];

const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#f1f5f9',
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  fontSize: '14px',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  color: '#64748b',
  marginBottom: '6px',
};

const Field = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const SelectInput = ({ value, onChange, children, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    style={{ ...inputStyle, cursor: 'pointer' }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </select>
);

const INITIAL = {
  product_name: '', item_type: '', brand: '',
  size: '', quantity: '1', price: '', image_file: null, image_url: '',
};

const AddItemModal = ({ isOpen, onClose, onAddItem, item }) => {
  const [form, setForm] = useState(INITIAL);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        product_name: item.product_name || '',
        item_type: item.item_type || '',
        brand: item.brand || '',
        size: item.size != null ? String(item.size) : '',
        quantity: item.quantity != null ? String(item.quantity) : '1',
        price: item.price != null ? String(item.price) : '',
        image_file: null,
        image_url: item.image_url || '',
      });
    } else {
      setForm(INITIAL);
    }
  }, [item, isOpen]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, item_type: type, brand: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddItem(form);
  };

  const handleFile = (file) => {
    if (file) set('image_file', file);
  };

  const isCard = CARD_CATEGORIES.includes(form.item_type);
  const sizeLabel = isCard ? 'Grade (e.g. 10, 9.5)' : form.item_type === 'shoes' ? 'Size (US)' : form.item_type === 'clothing' ? 'Size (e.g. M, L, XL)' : 'Size / Condition';
  const brandLabel = isCard ? 'Grader' : 'Brand';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold text-white">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Product name */}
          <Field label="Product Name *">
            <input
              type="text"
              value={form.product_name}
              onChange={(e) => set('product_name', e.target.value)}
              placeholder="e.g. Jordan 1 Retro High OG Chicago"
              style={inputStyle}
              required
            />
          </Field>

          {/* Category */}
          <Field label="Category *">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeChange(key)}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={
                    form.item_type === key
                      ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer' }
                      : { background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b', cursor: 'pointer' }
                  }
                >
                  <span className="text-xl">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Brand / Grader */}
          {form.item_type && (
            <Field label={brandLabel}>
              <SelectInput
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder={`Select ${brandLabel.toLowerCase()}…`}
              >
                {(BRANDS[form.item_type] || []).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </SelectInput>
            </Field>
          )}

          {/* Size / Grade — show for shoes, clothing, and cards */}
          {form.item_type && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={sizeLabel}>
                <input
                  type={isCard || form.item_type === 'shoes' ? 'number' : 'text'}
                  value={form.size}
                  onChange={(e) => set('size', e.target.value)}
                  placeholder={isCard ? '10' : form.item_type === 'shoes' ? '10.5' : 'M'}
                  style={inputStyle}
                  step={isCard ? '0.5' : 'any'}
                />
              </Field>

              <Field label="Quantity *">
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  min="1"
                  style={inputStyle}
                  required
                />
              </Field>
            </div>
          )}

          {/* Price */}
          {form.item_type && (
            <Field label="Purchase Price (£) *">
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: '#475569' }}
                >
                  £
                </span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                  required
                />
              </div>
            </Field>
          )}

          {/* Image */}
          {form.item_type && (
            <Field label="Image (optional)">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                className="relative rounded-xl flex flex-col items-center justify-center py-6 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: dragOver ? 'rgba(139,92,246,0.05)' : 'var(--surface-2)',
                }}
                onClick={() => document.getElementById('img-upload').click()}
              >
                {form.image_file || form.image_url ? (
                  <div className="flex flex-col items-center gap-2">
                    {form.image_url && !form.image_file && (
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded-lg mb-1"
                      />
                    )}
                    <p className="text-xs" style={{ color: '#10b981' }}>
                      {form.image_file ? `Selected: ${form.image_file.name}` : 'Current image (click to replace)'}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={20} style={{ color: '#334155', marginBottom: '8px' }} />
                    <p className="text-xs" style={{ color: '#475569' }}>
                      Click or drag to upload an image
                    </p>
                  </>
                )}
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            </Field>
          )}

          {/* Footer inside form so type="submit" triggers validation */}
          <div
            className="flex items-center justify-end gap-3 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', cursor: 'pointer' }}
            >
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
