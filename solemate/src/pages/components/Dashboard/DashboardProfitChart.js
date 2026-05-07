"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div
      className="px-3 py-2 rounded-lg text-sm"
      style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
    >
      <p className="font-semibold">{label}</p>
      <p style={{ color: val >= 0 ? '#10b981' : '#ef4444' }}>
        £{Number(val).toFixed(2)}
      </p>
    </div>
  );
};

export default function DashboardProfitChart() {
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('sales').select('*');
      if (error) { setLoading(false); return; }

      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          monthNum: d.getMonth(),
          profit: 0,
        });
      }

      data.forEach((sale) => {
        const d = new Date(sale.sale_date);
        const entry = months.find(
          (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear()
        );
        if (entry) entry.profit += sale.profit || 0;
      });

      setProfitData(months.map((m) => ({ month: m.month, profit: parseFloat(m.profit.toFixed(2)) })));
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
        <h3 className="text-base font-semibold text-white">Profit Overview</h3>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Monthly profit — last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={profitData} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12 }}
            tickFormatter={(v) => `£${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
            {profitData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#7c3aed' : '#ef4444'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
