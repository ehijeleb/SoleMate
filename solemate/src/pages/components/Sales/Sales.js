import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../Layout';
import AddSaleModal from './AddSaleModal';
import { Plus, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp } from 'lucide-react';

const formatCurrency = (val) => `£${Number(val || 0).toFixed(2)}`;

const ProfitCell = ({ value }) => {
  const num = Number(value || 0);
  const positive = num >= 0;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={
        positive
          ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
          : { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
      }
    >
      {positive ? '+' : ''}£{Math.abs(num).toFixed(2)}
    </span>
  );
};

const Sales = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: inv }, { data: sal }] = await Promise.all([
        supabase.from('inventory').select('*').eq('user_id', user.id),
        supabase.from('sales').select('*').eq('user_id', user.id),
      ]);
      setInventory(inv || []);
      setSales(sal || []);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    setFilteredSales(
      sales.filter((s) => {
        const d = new Date(s.sale_date);
        return d.getMonth() === m && d.getFullYear() === y;
      })
    );
  }, [sales, currentDate]);

  const handleAddSale = async (sale) => {
    const { data: { user } } = await supabase.auth.getUser();
    const item = inventory.find((i) => i.id.toString() === sale.selectedItemId.toString());
    if (!item) return;

    const profit = sale.priceSold - item.price * sale.quantity;
    const { error } = await supabase.from('sales').insert([{
      user_id: user.id,
      inventory_item_id: item.id,
      product_name: item.product_name,
      brand: item.brand,
      size: item.size,
      quantity_sold: sale.quantity,
      price_sold: sale.priceSold,
      sale_date: sale.saleDate,
      profit,
    }]);

    if (!error) {
      const newQty = item.quantity - sale.quantity;
      if (newQty <= 0) {
        await supabase.from('inventory').delete().eq('id', item.id);
      } else {
        await supabase.from('inventory').update({ quantity: newQty }).eq('id', item.id);
      }
      const [{ data: inv }, { data: sal }] = await Promise.all([
        supabase.from('inventory').select('*').eq('user_id', user.id),
        supabase.from('sales').select('*').eq('user_id', user.id),
      ]);
      setInventory(inv || []);
      setSales(sal || []);
      setIsModalOpen(false);
    }
  };

  const handleDeleteSale = async (id) => {
    await supabase.from('sales').delete().eq('id', id);
    setSales((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const totalRevenue = filteredSales.reduce((t, s) => t + (s.price_sold || 0), 0);
  const totalProfit = filteredSales.reduce((t, s) => t + (s.profit || 0), 0);
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {filteredSales.length} {filteredSales.length === 1 ? 'sale' : 'sales'} in {monthLabel}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={15} />
          Log Sale
        </button>
      </div>

      {/* Month navigator + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: '#94a3b8', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white px-2">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: '#94a3b8', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <ShoppingBag size={14} style={{ color: '#a78bfa' }} />
            <span style={{ color: '#64748b' }}>Revenue:</span>
            <span className="font-semibold text-white">{formatCurrency(totalRevenue)}</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <TrendingUp size={14} style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }} />
            <span style={{ color: '#64748b' }}>Profit:</span>
            <span className="font-semibold" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      ) : filteredSales.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <ShoppingBag size={36} style={{ color: '#334155', marginBottom: '12px' }} />
          <p className="font-medium" style={{ color: '#475569' }}>No sales this month.</p>
          <p className="text-sm mt-1" style={{ color: '#334155' }}>Click &ldquo;Log Sale&rdquo; to record one.</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Product', 'Brand', 'Qty', 'Sold For', 'Profit', 'Date', 'Actions'].map((h) => (
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
              {filteredSales.map((sale, idx) => (
                <tr
                  key={sale.id}
                  style={{
                    background: idx % 2 === 0 ? 'var(--surface-1)' : 'rgba(255,255,255,0.01)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td className="px-4 py-3 font-medium text-white">{sale.product_name}</td>
                  <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{sale.brand || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}
                    >
                      {sale.quantity_sold}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{formatCurrency(sale.price_sold)}</td>
                  <td className="px-4 py-3">
                    <ProfitCell value={sale.profit} />
                  </td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>
                    {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {deleteConfirm === sale.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
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
                        onClick={() => setDeleteConfirm(sale.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSale={handleAddSale}
        inventory={inventory}
      />
    </Layout>
  );
};

export default Sales;
