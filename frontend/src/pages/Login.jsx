import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Store, User, ArrowRight, Sparkles, Check, Phone, Lock, MapPin, Building, KeyRound } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('VENDOR');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Grocery & Provisions');
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const u = await register({
          username,
          password,
          name,
          phone,
          role,
          shop_name: shopName,
          shop_category: shopCategory,
          address,
          upi_id: upiId
        });
        navigate(u.role === 'VENDOR' ? '/vendor' : '/customer');
      } else {
        const u = await login(username, password);
        navigate(u.role === 'VENDOR' ? '/vendor' : '/customer');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type) => {
    setError('');
    setLoading(true);
    try {
      const u = await quickLoginAs(type);
      navigate(u.role === 'VENDOR' ? '/vendor' : '/customer');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        {/* Quick Demo Access Bar */}
        <div className="glass-panel" style={{
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="#34d399" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', color: '#34d399', textTransform: 'uppercase' }}>
              Quick Demo Access (1-Click Test)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('vendor')}
              disabled={loading}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '8px 10px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'left'
              }}
            >
              <Store size={15} color="#34d399" />
              <div>
                <div style={{ fontWeight: 700 }}>Sharma Kirana</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Vendor Dashboard</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('customer1')}
              disabled={loading}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '8px 10px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'left'
              }}
            >
              <User size={15} color="#818cf8" />
              <div>
                <div style={{ fontWeight: 700 }}>Rahul Verma</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Customer (Pending Bill)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              {isRegister ? 'Join Trust Khata' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {isRegister 
                ? 'Create a transparent credit ledger account in seconds' 
                : 'Sign in to access your shop or personal credit notebook'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: !isRegister ? 'var(--emerald-600)' : 'transparent',
                color: '#fff'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: isRegister ? 'var(--emerald-600)' : 'transparent',
                color: '#fff'
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                {/* Role Switcher */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">I am registering as:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setRole('VENDOR')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${role === 'VENDOR' ? '#10b981' : 'var(--border-subtle)'}`,
                        background: role === 'VENDOR' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                        color: role === 'VENDOR' ? '#34d399' : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Store size={16} />
                      <span>Shopkeeper</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${role === 'CUSTOMER' ? '#6366f1' : 'var(--border-subtle)'}`,
                        background: role === 'CUSTOMER' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                        color: role === 'CUSTOMER' ? '#818cf8' : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <User size={16} />
                      <span>Customer</span>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                {role === 'VENDOR' && (
                  <>
                    <div style={{ marginBottom: '14px' }}>
                      <label className="form-label">Shop Name</label>
                      <input
                        type="text"
                        value={shopName}
                        onChange={e => setShopName(e.target.value)}
                        className="form-input"
                        placeholder="e.g. Laxmi General Store"
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label className="form-label">Shop Category</label>
                      <input
                        type="text"
                        value={shopCategory}
                        onChange={e => setShopCategory(e.target.value)}
                        className="form-input"
                        placeholder="e.g. Grocery, Dairy, Hardware"
                      />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label className="form-label">UPI ID for Payments (Optional)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="form-input"
                        placeholder="e.g. laxmistore@upi"
                      />
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Address / Landmark</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Sector 15 Market, Gandhinagar"
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input"
                placeholder="Choose a username"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <span>{loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
