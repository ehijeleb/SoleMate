import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Zap, TrendingUp } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales', icon: ShoppingBag },
];

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-50"
      style={{
        width: '240px',
        backgroundColor: 'var(--surface-1)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Zap size={17} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">SoleMate</span>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Reseller Hub</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#334155' }}>
          Menu
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline"
              style={
                isActive
                  ? {
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      color: '#c4b5fd',
                    }
                  : {
                      color: '#64748b',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <Icon
                size={17}
                style={{ color: isActive ? '#a78bfa' : '#475569', flexShrink: 0 }}
              />
              {label}
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#8b5cf6' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stats blurb */}
      <div className="mx-3 mb-3 px-3 py-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={13} style={{ color: '#8b5cf6' }} />
          <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Track Everything</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
          Sneakers, cards, streetwear and more — all in one place.
        </p>
      </div>

      {/* Sign Out */}
      <div className="px-3 pb-5" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline"
          style={{ color: '#64748b', border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
