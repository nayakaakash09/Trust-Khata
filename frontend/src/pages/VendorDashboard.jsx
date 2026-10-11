import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import PaymentModal from '../components/PaymentModal';
import ReminderModal from '../components/ReminderModal';
import { 
  Zap, 
  Search, 
  QrCode, 
  IndianRupee, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  Bell, 
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  FileText,
  ShieldCheck,
  Store,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Khatabook Navigation Tabs: 'CUSTOMERS' | 'TRANSACTIONS' | 'REPORTS'
  const [mainTab, setMainTab] = useState('CUSTOMERS');
  
  // Filters
  const [customerFilter, setCustomerFilter] = useState('ALL'); // 'ALL' | 'DUE' | 'SETTLED'
  const [txFilter, setTxFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'DISPUTED' | 'PAID'
  const [search, setSearch] = useState('');

  // Modals
  const [selectedTxForQR, setSelectedTxForQR] = useState(null);
  const [selectedTxForPayment, setSelectedTxForPayment] = useState(null);
  const [selectedTxForReminder, setSelectedTxForReminder] = useState(null);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [sumData, txData] = await Promise.all([
        api.transactions.getSummary(),
        api.transactions.list({ search: search.trim() })
      ]);
      setSummary(sumData);
      setTransactions(txData);
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 3000);
    return () => clearInterval(interval);
  }, [search]);

  // Dynamic avatar color generator for customers
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Filter Customers
  const customerList = (summary?.customers || []).filter(c => {
    const bal = Number(c.outstanding_balance || 0);
    if (customerFilter === 'DUE') return bal > 0;
    if (customerFilter === 'SETTLED') return bal === 0;
    return true;
  });

  // Filter Transactions
  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === 'ALL') return true;
    return tx.status === txFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* KHATABOOK STORE HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
          }}>
            <Store size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.vendor_profile?.shop_name || "Sharma Kirana & General Store"}
              </h1>
              <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981' }}>
                ✓ Verified Khata
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Shopkeeper: <strong>{user?.name || user?.username}</strong> • Verified Digital Credit Ledger
            </p>
          </div>
        </div>

        {/* Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchData} 
            className="btn-secondary" 
            style={{ padding: '10px 14px' }}
            title="Refresh Ledger"
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>

          <Link 
            to="/vendor/create" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '11px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
          >
            <Zap size={18} />
            <span>+ Quick Bill QR</span>
          </Link>
        </div>
      </div>

      {/* THE ICONIC KHATABOOK TWIN BANNER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* CARD 1: YOU WILL GET */}
        <div 
          className="kb-card" 
          style={{
            padding: '24px',
            borderLeft: '5px solid #ef4444',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '8px',
                borderRadius: '10px'
              }}>
                <ArrowDownLeft size={20} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                YOU WILL GET
              </span>
            </div>
            <span className="kb-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Outstanding
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ef4444', letterSpacing: '-0.02em' }}>
            ₹{summary ? Number(summary.total_outstanding).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total pending credit to collect from {summary?.customers?.filter(c => Number(c.outstanding_balance) > 0).length || 0} customers
          </div>
        </div>

        {/* CARD 2: YOU WILL GIVE / TOTAL SETTLED */}
        <div 
          className="kb-card" 
          style={{
            padding: '24px',
            borderLeft: '5px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '8px',
                borderRadius: '10px'
              }}>
                <ArrowUpRight size={20} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                TOTAL SETTLED / DEPOSITED
              </span>
            </div>
            <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Collected
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>
            ₹{summary ? Number(summary.total_collected).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total payments recovered & entered into ledger
          </div>
        </div>
      </div>

      {/* KHATABOOK CORE TABS */}
      <div className="kb-tabs">
        <button
          className={`kb-tab-btn ${mainTab === 'CUSTOMERS' ? 'active' : ''}`}
          onClick={() => setMainTab('CUSTOMERS')}
        >
          <Users size={18} />
          <span>CUSTOMERS</span>
          <span className="kb-pill" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
            {summary?.customers?.length || 0}
          </span>
        </button>

        <button
          className={`kb-tab-btn ${mainTab === 'TRANSACTIONS' ? 'active' : ''}`}
          onClick={() => setMainTab('TRANSACTIONS')}
        >
          <FileText size={18} />
          <span>ALL BILLS & QR</span>
          <span className="kb-pill" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
            {transactions.length}
          </span>
        </button>

        <button
          className={`kb-tab-btn ${mainTab === 'REPORTS' ? 'active' : ''}`}
          onClick={() => setMainTab('REPORTS')}
        >
          <TrendingUp size={18} />
          <span>KHATA REPORTS</span>
        </button>
      </div>

      {/* SEARCH BAR & QUICK FILTERS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={mainTab === 'CUSTOMERS' ? "Search customer by name or mobile..." : "Search bills by items, customer..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Sub-Filters */}
        {mainTab === 'CUSTOMERS' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCustomerFilter('ALL')}
              className={`kb-chip ${customerFilter === 'ALL' ? 'active' : ''}`}
            >
              All Customers ({summary?.customers?.length || 0})
            </button>
            <button
              onClick={() => setCustomerFilter('DUE')}
              className={`kb-chip ${customerFilter === 'DUE' ? 'active' : ''}`}
              style={customerFilter === 'DUE' ? { background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', borderColor: '#ef4444' } : {}}
            >
              Has Dues
            </button>
            <button
              onClick={() => setCustomerFilter('SETTLED')}
              className={`kb-chip ${customerFilter === 'SETTLED' ? 'active' : ''}`}
            >
              Settled (₹0)
            </button>
          </div>
        )}

        {mainTab === 'TRANSACTIONS' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'DISPUTED', 'PAID'].map(st => (
              <button
                key={st}
                onClick={() => setTxFilter(st)}
                className={`kb-chip ${txFilter === st ? 'active' : ''}`}
              >
                {st === 'ALL' ? 'All Bills' : st === 'PENDING' ? '🟡 Awaiting Scan' : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: CUSTOMERS KHATA BOOK */}
      {mainTab === 'CUSTOMERS' && (
        <div className="kb-card" style={{ padding: '8px', overflow: 'hidden' }}>
          {customerList.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                No Customers Found
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                Create a quick QR bill for a customer. Once scanned, they will automatically appear in your Khata book!
              </p>
              <Link to="/vendor/create" className="btn-primary">
                <Zap size={16} />
                <span>+ Create Quick Bill QR</span>
              </Link>
            </div>
          ) : (
            <div>
              {customerList.map((c, idx) => {
                const bal = Number(c.outstanding_balance || 0);
                const hasDue = bal > 0;

                return (
                  <div
                    key={c.phone || c.name || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      padding: '16px 20px',
                      borderBottom: idx === customerList.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                      borderRadius: '12px'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Left: Avatar & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="kb-avatar" style={{ background: getAvatarColor(c.name) }}>
                        {(c.name || 'C').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>
                          {c.name || 'Anonymous Customer'}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📱 {c.phone || 'No phone recorded'}</span>
                          <span>•</span>
                          <span>{c.total_transactions} Entries</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Balance & Quick Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: hasDue ? '#ef4444' : '#10b981'
                        }}>
                          ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: hasDue ? '#f87171' : '#34d399',
                          textTransform: 'uppercase'
                        }}>
                          {hasDue ? "YOU'LL GET" : "SETTLED"}
                        </span>
                      </div>

                      {/* Khatabook action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasDue && (
                          <button
                            onClick={() => {
                              // Find an accepted transaction for this customer
                              const targetTx = transactions.find(t => t.customer_phone === c.phone && t.status === 'ACCEPTED');
                              if (targetTx) {
                                setSelectedTxForReminder(targetTx);
                              } else {
                                alert(`Customer ${c.name} owes Rs. ${bal}. You can remind them on WhatsApp.`);
                              }
                            }}
                            style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: '#4ade80',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            title="Send WhatsApp Payment Reminder"
                          >
                            <MessageCircle size={15} />
                            <span>Remind</span>
                          </button>
                        )}

                        <Link
                          to={`/ledger?phone=${c.phone}`}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: 'var(--text-main)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FileText size={14} />
                          <span>Ledger</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSACTIONS & BILLS */}
      {mainTab === 'TRANSACTIONS' && (
        <div className="kb-card" style={{ padding: '8px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                No Bills Found
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Generate your first digital credit bill with the Quick Bill QR generator.
              </p>
            </div>
          ) : (
            <div>
              {filteredTransactions.map((tx, idx) => {
                const isPendingScan = !tx.customer_name && tx.status === 'PENDING';

                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      padding: '16px 20px',
                      borderBottom: idx === filteredTransactions.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Left: Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="kb-avatar" style={{
                        background: isPendingScan ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : getAvatarColor(tx.customer_name)
                      }}>
                        {isPendingScan ? 'QR' : (tx.customer_name || 'C').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff' }}>
                            {tx.customer_name || 'Awaiting Customer Scan...'}
                          </span>
                          <StatusBadge status={tx.status} />
                          {isPendingScan && (
                            <span className="kb-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                              Live QR
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#cbd5e1' }}>🛒 {tx.description || 'Credit Goods'}</span>
                          <span>•</span>
                          <span>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                          ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {tx.status === 'ACCEPTED' && Number(tx.remaining_balance) > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700 }}>
                            Due: ₹{Number(tx.remaining_balance).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedTxForQR(tx)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Show QR Code"
                        >
                          <QrCode size={15} />
                          <span>QR</span>
                        </button>

                        {tx.status === 'ACCEPTED' && Number(tx.remaining_balance) > 0 && (
                          <button
                            onClick={() => setSelectedTxForPayment(tx)}
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#34d399',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CreditCard size={15} />
                            <span>Got ₹</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KHATA REPORTS */}
      {mainTab === 'REPORTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="kb-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#38bdf8" />
              <span>Credit Summary</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Total Credit Issued:</span>
                <strong style={{ color: '#ffffff' }}>₹{summary ? Number(summary.total_credit_extended).toLocaleString() : '0'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Total Recovered:</span>
                <strong style={{ color: '#34d399' }}>₹{summary ? Number(summary.total_collected).toLocaleString() : '0'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Net Outstanding Dues:</span>
                <strong style={{ color: '#ef4444' }}>₹{summary ? Number(summary.total_outstanding).toLocaleString() : '0'}</strong>
              </div>
            </div>
          </div>

          <div className="kb-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <span>Transaction Counts</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{summary?.counts?.total || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Entries</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{summary?.counts?.accepted || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Accepted & Active</div>
              </div>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>{summary?.counts?.paid || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>Fully Settled</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{summary?.counts?.pending || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Pending Scan</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTxForQR && (
        <QRModal
          transaction={selectedTxForQR}
          onClose={() => {
            setSelectedTxForQR(null);
            fetchData();
          }}
        />
      )}

      {selectedTxForPayment && (
        <PaymentModal
          transaction={selectedTxForPayment}
          onClose={() => setSelectedTxForPayment(null)}
          onSuccess={() => {
            setSelectedTxForPayment(null);
            fetchData();
          }}
        />
      )}

      {selectedTxForReminder && (
        <ReminderModal
          transaction={selectedTxForReminder}
          onClose={() => setSelectedTxForReminder(null)}
        />
      )}
    </div>
  );
}
