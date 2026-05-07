import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';

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

const INITIAL = { selectedItemId: '', quantity: '1', priceSold: '', saleDate: '' };

const AddSaleModal = ({ isOpen, onClose, onAddSale, inventory }) => {
  const [form, setForm] = useState(INITIAL);
  const [estimatedProfit, setEstimatedProfit] = useState(null);

  useEffect(() => {
    if (!isOpen) setForm(INITIAL);
  }, [isOpen]);

  useEffect(() => {
    if (form.selectedItemId && form.priceSold && form.quantity) {
      const item = inventory.find((i) => i.id.toString() === form.selectedItemId);
      if (item) {
        const profit = parseFloat(form.priceSold) - item.price * parseInt(form.quantity, 10);
        setEstimatedProfit(profit);
      }
    } else {
      setEstimatedProfit(null);
    }
  }, [form.selectedItemId, form.priceSold, form.quantity, inventory]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSale({
      selectedItemId: form.selectedItemId,
      quantity: parseInt(form.quantity, 10),
      priceSold: parseFloat(form.priceSold),
      saleDate: form.saleDate,
    });
  };

  if (!isOpen) return null;

  const selectedItem = inventory.find((i) => i.id.toString() === form.selectedItemId);
  const maxQty = selectedItem?.quantity ?? 99;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--surface-1)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold text-white">Log New Sale</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Item */}
          <div>
            <label style={labelStyle}>Item *</label>
            <select
              value={form.selectedItemId}
              onChange={(e) => set('selectedItemId', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Select an item from inventory…</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_name} — Qty: {item.quantity} · Cost: £{Number(item.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Qty + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Quantity Sold *</label>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                style={inputStyle}
                required
              />
              {selectedItem && (
                <p className="text-xs mt-1" style={{ color: '#475569' }}>
                  Max: {selectedItem.quantity}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Price Sold (£) *</label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#475569' }}
                >
                  £
                </span>
                <input
                  type="number"
                  value={form.priceSold}
                  onChange={(e) => set('priceSold', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Sale Date *</label>
            <input
              type="date"
              value={form.saleDate}
              onChange={(e) => set('saleDate', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* Profit preview */}
          {estimatedProfit !== null && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={
                estimatedProfit >= 0
                  ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }
                  : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }
              }
            >
              <div className="flex items-center gap-2">
                <DollarSign size={14} style={{ color: estimatedProfit >= 0 ? '#10b981' : '#ef4444' }} />
                <span className="text-sm" style={{ color: '#64748b' }}>Estimated profit</span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: estimatedProfit >= 0 ? '#10b981' : '#ef4444' }}
              >
                {estimatedProfit >= 0 ? '+' : ''}£{Math.abs(estimatedProfit).toFixed(2)}
              </span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', cursor: 'pointer' }}
            >
              Log Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaleModal;
