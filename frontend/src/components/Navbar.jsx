import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, 
  Store, 
  User, 
  PlusCircle, 
  QrCode, 
  Bell, 
  LogOut, 
  Users, 
  Layers, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, quickLoginAs, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.notifications.list()
        .then(list => {
          const unread = list.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (type) => {
    setShowSwitchMenu(false);
    await quickLoginAs(type);
    navigate(type === 'vendor' ? '/vendor' : '/customer');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Trust</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text-emerald">Khata</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '-2px' }}>
              Digital Credit Ledger
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {role === 'VENDOR' ? (
              <>
                <Link 
                  to="/vendor" 
                  className={location.pathname === '/vendor' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Store size={16} />
                  <span>Shop Dashboard</span>
                </Link>
                <Link 
                  to="/vendor/create" 
                  className={location.pathname === '/vendor/create' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <PlusCircle size={16} />
                  <span>New Credit</span>
                </Link>
                <Link 
                  to="/ledger" 
                  className={location.pathname === '/ledger' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Layers size={16} />
                  <span>Shared Ledger</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/customer" 
                  className={location.pathname === '/customer' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <User size={16} />
                  <span>My Khata</span>
                </Link>
                <Link 
                  to="/scan" 
                  className={location.pathname === '/scan' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <QrCode size={16} />
                  <span>Scan QR</span>
                </Link>
                <Link 
                  to="/ledger" 
                  className={location.pathname === '/ledger' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Layers size={16} />
                  <span>Ledger</span>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Right Section / Auth & Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              {/* Quick Persona Switcher */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: role === 'VENDOR' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    border: `1px solid ${role === 'VENDOR' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                  title="Switch Demo Role"
                >
                  {role === 'VENDOR' ? <Store size={14} color="#34d399" /> : <User size={14} color="#818cf8" />}
                  <span style={{ fontWeight: 600 }}>{user?.name || user?.username}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: role === 'VENDOR' ? '#10b981' : '#6366f1',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    color: '#fff'
                  }}>
                    {role}
                  </span>
                  <ChevronDown size={12} color="#94a3b8" />
                </button>

                {showSwitchMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '240px',
                    background: '#0f172a',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: '8px',
                    zIndex: 200
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Switch Demo Perspective
                    </div>
                    <button
                      onClick={() => handleQuickSwitch('vendor')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: role === 'VENDOR' ? '#34d399' : '#e2e8f0',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Store size={14} />
                      <div>
                        <div style={{ fontWeight: 600 }}>Sharma Kirana (Vendor)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Shopkeeper ledger & QR</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('customer1')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: user?.username === 'rahul_v' ? '#818cf8' : '#e2e8f0',
                        fontSize: '0.8rem'
                      }}
                    >
                      <User size={14} />
                      <div>
                        <div style={{ fontWeight: 600 }}>Rahul Verma (Customer)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Pending verification test</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('customer2')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: user?.username === 'priya_s' ? '#818cf8' : '#e2e8f0',
                        fontSize: '0.8rem'
                      }}
                    >
                      <User size={14} />
                      <div>
                        <div style={{ fontWeight: 600 }}>Priya Sharma (Customer)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Clean active ledger</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
