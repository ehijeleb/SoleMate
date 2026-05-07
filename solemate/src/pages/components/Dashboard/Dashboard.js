import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { supabase } from '../../../lib/supabaseClient';
import DashboardProfitChart from './DashboardProfitChart';
import DashboardBrandBreakdown from './DashboardBrandBreakdown';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, BarChart2 } from 'lucide-react';

const TIME_PERIODS = ['Last Week', 'Last Month', 'Last 6 Months', 'Last Year', 'All Time'];

const filterByPeriod = (data, period, dateKey = 'sale_date') => {
  if (period === 'All Time') return data;
  const now = new Date();
  const cutoff = new Date(now);
  if (period === 'Last Week') cutoff.setDate(now.getDate() - 7);
  else if (period === 'Last Month') cutoff.setMonth(now.getMonth() - 1);
  else if (period === 'Last 6 Months') cutoff.setMonth(now.getMonth() - 6);
  else if (period === 'Last Year') cutoff.setFullYear(now.getFullYear() - 1);
  return data.filter((item) => new Date(item[dateKey] || item.date_added) >= cutoff);
};

const StatCard = ({ icon: Icon, label, value, sub, iconColor, glowColor, periodPicker, onPeriodChange, period }) => (
  <div
    className="p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
    style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
    <div className="flex items-start justify-between relative z-10">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}25` }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      {periodPicker && (
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="text-xs rounded-lg px-2 py-1 outline-none"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            color: '#94a3b8',
          }}
        >
          {TIME_PERIODS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#475569' }}>{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [spentPeriod, setSpentPeriod] = useState('All Time');
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitPeriod, setProfitPeriod] = useState('All Time');
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      setUserName(`${firstName} ${lastName}`.trim());

      const [{ data: salesData }, { data: inventoryData }] = await Promise.all([
        supabase.from('sales').select('*').eq('user_id', user.id),
        supabase.from('inventory').select('*').eq('user_id', user.id),
      ]);

      if (salesData) {
        setSales(salesData);
        const rev = salesData.reduce((s, x) => s + (x.price_sold || 0), 0);
        setTotalRevenue(rev.toFixed(2));
        setTotalSalesCount(salesData.length);
      }
      if (inventoryData) {
        setInventory(inventoryData);
        setTotalItems(inventoryData.reduce((s, x) => s + (x.quantity || 0), 0));
      }
    };
    init();
  }, []);

  useEffect(() => {
    const filtered = filterByPeriod(sales, profitPeriod);
    const profit = filtered.reduce((s, x) => s + (x.profit || 0), 0);
    setTotalProfit(profit.toFixed(2));
  }, [sales, profitPeriod]);

  useEffect(() => {
    const calcSpent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('shoe_log').select('*').eq('user_id', user.id);
      if (!data) return;
      const filtered = filterByPeriod(data, spentPeriod, 'date_added');
      const spent = filtered.reduce((s, x) => s + (x.price || 0) * (x.quantity || 0), 0);
      setTotalSpent(spent.toFixed(2));
    };
    calcSpent();
  }, [spentPeriod]);

  const profitNum = parseFloat(totalProfit);
  const profitPositive = profitNum >= 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm mb-1" style={{ color: '#64748b' }}>{greeting()}</p>
        <h1 className="text-3xl font-bold text-white">
          {userName ? `Hey, ${userName.split(' ')[0]} 👋` : 'Dashboard'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Here&apos;s how your resell business is performing.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`£${totalRevenue}`}
          sub={`${totalSalesCount} sales`}
          iconColor="#a78bfa"
          glowColor="rgba(167,139,250,0.08)"
        />
        <StatCard
          icon={TrendingUp}
          label="Net Profit"
          value={<span style={{ color: profitPositive ? '#10b981' : '#ef4444' }}>£{totalProfit}</span>}
          sub={profitPeriod}
          iconColor={profitPositive ? '#10b981' : '#ef4444'}
          glowColor={profitPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}
          periodPicker
          period={profitPeriod}
          onPeriodChange={setProfitPeriod}
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Spent"
          value={`£${totalSpent}`}
          sub={spentPeriod}
          iconColor="#f59e0b"
          glowColor="rgba(245,158,11,0.08)"
          periodPicker
          period={spentPeriod}
          onPeriodChange={setSpentPeriod}
        />
        <StatCard
          icon={Package}
          label="Items in Stock"
          value={totalItems}
          sub={`${inventory.length} unique listings`}
          iconColor="#38bdf8"
          glowColor="rgba(56,189,248,0.08)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <DashboardProfitChart />
        </div>
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <DashboardBrandBreakdown />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
