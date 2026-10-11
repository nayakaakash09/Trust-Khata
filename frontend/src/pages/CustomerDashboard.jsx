import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  QrCode, 
  IndianRupee, 
  Store, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Shield, 
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw,
  User,
  Phone,
  Edit3
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, loginCustomer, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [switching, setSwitching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [sumData, txData] = await Promise.all([
        api.transactions.getSummary(),
        api.transactions.list()
      ]);
      setSummary(sumData);
      setTransactions(txData);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'CUSTOMER' && !switching) {
      fetchData();
      const interval = setInterval(() => fetchData(true), 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user, switching]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const cleanPhone = lookupPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmitting(true);
    try {
      await loginCustomer(lookupName.trim() || `Customer (${cleanPhone.slice(-4)})`, cleanPhone);
      setSwitching(false);
    } catch (err) {
      setFormError(err.message || 'Failed to access passbook.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = async (roleKey) => {
    setSubmitting(true);
    try {
      await quickLoginAs(roleKey);
      setSwitching(false);
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING');

  if (!user || user?.role !== 'CUSTOMER' || switching) {
    return (
      <div style={{ maxWidth: '480px', margin: '40px auto', padding: '24px 16px' }}>
        <div className="kb-card" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 14px',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
            }}>
              <User size={28} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              Customer Khata Passbook
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your mobile number to view your credit dues, bills, and payment records across all local shops.
            </p>
          </div>

          <form onSubmit={handleLookupSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                YOUR MOBILE NUMBER <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number (e.g. 9876501234)"
                  value={lookupPhone}
                  onChange={e => {
                    setLookupPhone(e.target.value.replace(/\D/g, ''));
                    setFormError('');
                  }}
                  className="form-input"
                  style={{ fontSize: '0.95rem', padding: '12px 12px 12px 38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                YOUR FULL NAME (OPTIONAL)
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singh"
                  value={lookupName}
                  onChange={e => setLookupName(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.95rem', padding: '12px 12px 12px 38px' }}
                />
              </div>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{submitting ? 'Opening Passbook...' : 'Open My Khata Passbook'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {switching && user && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setSwitching(false)}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                Cancel & Return to {user.name}
              </button>
            </div>
          )}

          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
              Quick Evaluator Demo Access:
            </span>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoSelect('customer1')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  color: '#93c5fd',
                  cursor: 'pointer'
                }}
              >
                ⚡ Rahul Verma (9812345678)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('customer2')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  color: '#93c5fd',
                  cursor: 'pointer'
                }}
              >
                ⚡ Priya Sharma (9876543211)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            My Credit Khata
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Welcome, <strong>{user?.name || user?.username}</strong> {user?.phone ? `(📱 ${user.phone})` : ''} • Verified Digital Credit Ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setSwitching(true)} 
            className="btn-secondary" 
            style={{ padding: '9px 12px', fontSize: '0.82rem' }}
            title="Switch Account"
          >
            <User size={14} />
            <span>Switch Account</span>
          </button>
          <button 
            onClick={() => fetchData(false)} 
            className="btn-secondary" 
            style={{ padding: '9px 14px' }}
            title="Refresh Data"
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>
          <Link to="/scan" className="btn-primary" style={{ padding: '9px 18px' }}>
            <QrCode size={16} />
            <span>Scan Shop QR</span>
          </Link>
        </div>
      </div>

      {/* Action Banner for Pending Verifications */}
      {pendingTransactions.length > 0 && (
        <div className="glass-panel-glow" style={{
          padding: '18px 22px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#f59e0b',
                color: '#000',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                !
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fbbf24' }}>
                  {pendingTransactions.length} Pending Credit Verification{pendingTransactions.length > 1 ? 's' : ''}!
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                  Latest: <strong>₹{pendingTransactions[0].amount}</strong> from <strong>{pendingTransactions[0].shop_name}</strong> ("{pendingTransactions[0].description}")
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/verify/${pendingTransactions[0].secure_token}`)}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                fontWeight: 800,
                padding: '10px 18px'
              }}
            >
              <span>Review & Confirm Bill</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row (Khatabook Customer View) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total Outstanding Credit Debt */}
        <div className="kb-card" style={{
          padding: '22px',
          borderLeft: '5px solid #ef4444',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              YOU WILL PAY
            </span>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '6px', borderRadius: '8px' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444' }}>
            ₹{summary ? Number(summary.total_debt_outstanding).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current total credit balance across all local shops
          </div>
        </div>

        {/* Total Settled */}
        <div className="kb-card" style={{
          padding: '22px',
          borderLeft: '5px solid #10b981',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOTAL SETTLED
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981' }}>
            ₹{summary ? Number(summary.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified settled payments
          </div>
        </div>

        {/* Linked Shops */}
        <div className="kb-card" style={{
          padding: '22px',
          borderLeft: '5px solid #38bdf8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LINKED SHOPS
            </span>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px', borderRadius: '8px' }}>
              <Store size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8' }}>
            {summary?.linked_shops?.length || 0} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>merchants</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active trusted local stores
          </div>
        </div>
      </div>

      {/* Linked Shops Breakdown Cards */}
      {summary?.linked_shops && summary.linked_shops.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px' }}>
            My Active Store Accounts
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px'
          }}>
            {summary.linked_shops.map((shop, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{shop.shop_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Merchant: {shop.vendor_name} • {shop.total_transactions} orders
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: Number(shop.outstanding_balance) > 0 ? '#fbbf24' : '#34d399'
                  }}>
                    ₹{Number(shop.outstanding_balance).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>balance due</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions History */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
          Credit Ledger Entries
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          All recorded credit entries with verification status and payment records
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Loading ledger records...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Layers size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>No transactions recorded yet</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              When a shopkeeper records credit for you, it will appear here for verification.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map(tx => (
              <div
                key={tx.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                {/* Left */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                      {tx.shop_name}
                    </span>
                    <StatusBadge status={tx.status} size="sm" />
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    {tx.description}
                  </div>

                  {tx.status === 'DISPUTED' && tx.dispute_reason && (
                    <div style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      color: '#fb7185',
                      marginTop: '6px'
                    }}>
                      <strong>Dispute Note:</strong> {tx.dispute_reason}
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Bill date: {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    ₹{tx.amount}
                  </div>
                  {tx.status === 'ACCEPTED' && (
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                      Remaining: ₹{tx.remaining_balance}
                    </div>
                  )}
                  {Number(tx.total_paid) > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                      Paid: ₹{tx.total_paid}
                    </div>
                  )}
                </div>

                {/* Action */}
                {tx.status === 'PENDING' && (
                  <button
                    onClick={() => navigate(`/verify/${tx.secure_token}`)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 700 }}
                  >
                    <span>Verify Bill</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
