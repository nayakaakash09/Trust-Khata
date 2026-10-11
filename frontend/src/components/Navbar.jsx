import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, 
  Store, 
  User, 
  PlusCircle, 
  Zap,
  QrCode, 
  Bell, 
  LogOut, 
  Users, 
  Layers, 
  CheckCheck,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, quickLoginAs, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const fetchNotifications = () => {
    if (isAuthenticated) {
      api.notifications.list()
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setNotifications(arr);
          const unread = arr.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) {
        try { await api.notifications.markRead(n.id); } catch (e) {}
      }
    }
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 20px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            role === 'VENDOR' ? (
              <>
                <Link 
                  to="/vendor" 
                  className={location.pathname === '/vendor' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Store size={15} />
                  <span>Shop Dashboard</span>
                </Link>
                <Link 
                  to="/vendor/create" 
                  className={location.pathname === '/vendor/create' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Zap size={15} />
                  <span>+ Quick Bill QR</span>
                </Link>
                <Link 
                  to="/ledger" 
                  className={location.pathname === '/ledger' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Layers size={15} />
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
                  <User size={15} />
                  <span>My Khata</span>
                </Link>
                <Link 
                  to="/scan" 
                  className={location.pathname === '/scan' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <QrCode size={15} />
                  <span>Scan QR</span>
                </Link>
                <Link 
                  to="/ledger" 
                  className={location.pathname === '/ledger' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Layers size={15} />
                  <span>Ledger</span>
                </Link>
              </>
            )
          ) : (
            <>
              <Link 
                to="/scan" 
                className={location.pathname === '/scan' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <QrCode size={15} />
                <span>Scan QR</span>
              </Link>
              <Link 
                to="/ledger" 
                className={location.pathname === '/ledger' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Layers size={15} />
                <span>Public Ledger</span>
              </Link>
              <button 
                onClick={() => handleQuickSwitch('vendor')} 
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.82rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
              >
                <Store size={14} />
                <span>Demo Vendor</span>
              </button>
              <button 
                onClick={() => handleQuickSwitch('customer1')} 
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.82rem', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}
              >
                <User size={14} />
                <span>Demo Customer</span>
              </button>
            </>
          )}
        </div>

        {/* Right Section / Auth & Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <>
              {/* Notifications Bell Button */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #090d16'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {showNotifMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '120%',
                    width: '320px',
                    background: '#0f172a',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                    padding: '12px',
                    zIndex: 250
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        No notifications yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                        {notifications.map((n, i) => (
                          <div 
                            key={n.id || i}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              background: n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(56, 189, 248, 0.08)',
                              border: n.is_read ? '1px solid transparent' : '1px solid rgba(56, 189, 248, 0.25)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: n.is_read ? '#cbd5e1' : '#38bdf8', marginBottom: '2px' }}>
                              {n.title || 'Ledger Update'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                              {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                    fontSize: '0.8rem',
                    cursor: 'pointer'
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
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none'
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
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none'
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
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none'
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
