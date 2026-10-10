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
  RefreshCw
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING');

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
            Welcome, <strong>{user?.name || user?.username}</strong> • Verified Digital Credit Ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchData} 
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

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total Outstanding Credit Debt */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Outstanding Balance
            </span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '6px', borderRadius: '8px' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>
            ₹{summary ? Number(summary.total_debt_outstanding).toLocaleString() : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Current total credit balance across all local shops
          </div>
        </div>

        {/* Total Settled */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Paid & Settled
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399' }}>
            ₹{summary ? Number(summary.total_paid).toLocaleString() : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Verified settled payments
          </div>
        </div>

        {/* Linked Shops */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Linked Shops
            </span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px', borderRadius: '8px' }}>
              <Store size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818cf8' }}>
            {summary?.linked_shops?.length || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>merchants</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
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
