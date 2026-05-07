import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Zap, TrendingUp, Package, ShoppingBag, Eye, EyeOff } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, label: 'Profit Tracking', desc: 'Real-time P&L across all your inventory' },
  { icon: Package, label: 'Multi-Category', desc: 'Sneakers, cards, streetwear & more' },
  { icon: ShoppingBag, label: 'Sales Analytics', desc: 'Monthly breakdowns & trend charts' },
];

const Login = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface-0)' }}>
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-10"
        style={{
          background: 'linear-gradient(160deg, #0f0f1e 0%, #1a0a2e 50%, #0d1a0d 100%)',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SoleMate</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            The smarter way to<br />
            <span style={{ color: '#a78bfa' }}>manage your resells.</span>
          </h1>
          <p className="text-base mb-10" style={{ color: '#64748b', lineHeight: '1.7' }}>
            Track inventory, log sales and watch your profits grow — whether you flip sneakers, Pokémon cards, or luxury goods.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  <Icon size={16} style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs relative z-10" style={{ color: '#2d3748' }}>
          © 2025 SoleMate. Built for resellers.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              <Zap size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">SoleMate</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#64748b' }}>
            {isRegister
              ? 'Start tracking your resell portfolio today.'
              : 'Sign in to your reseller dashboard.'}
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  Confirm password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-dark"
                  required
                />
              </div>
            )}

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: '#475569' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="font-semibold transition-colors"
              style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
