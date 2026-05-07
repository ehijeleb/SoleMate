"use client";

import React, { useState, useEffect } from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../../lib/supabaseClient';

const PALETTE = [
  '#8b5cf6', '#10b981', '#f59e0b', '#38bdf8',
  '#f472b6', '#a3e635', '#fb923c', '#818cf8',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-sm"
      style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
    >
      <p className="font-semibold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value} units</p>
    </div>
  );
};

const DashboardBrandBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: inv } = await supabase
        .from('inventory')
        .select('item_type, quantity')
        .eq('user_id', user.id);

      if (inv) {
        const counts = {};
        inv.forEach((item) => {
          const key = item.item_type || 'Other';
          counts[key] = (counts[key] || 0) + (item.quantity || 0);
        });
        const formatted = Object.entries(counts).map(([name, value], i) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value,
          fill: PALETTE[i % PALETTE.length],
        }));
        setData(formatted);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Category Breakdown</h3>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Inventory by item type</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: '#475569' }}>No inventory data yet.</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
                  <span style={{ color: '#94a3b8' }}>{entry.name}</span>
                </div>
                <span className="font-medium text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBrandBreakdown;
