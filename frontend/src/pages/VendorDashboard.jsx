import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import PaymentModal from '../components/PaymentModal';
import ReminderModal from '../components/ReminderModal';
import { 
  PlusCircle, 
  Search, 
  QrCode, 
  IndianRupee, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  Bell, 
  Layers, 
  Filter,
  RefreshCw
} from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedTxForQR, setSelectedTxForQR] = useState(null);
  const [selectedTxForPayment, setSelectedTxForPayment] = useState(null);
  const [selectedTxForReminder, setSelectedTxForReminder] = useState(null);

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'ALL') return true;
    return tx.status === activeTab;
  });

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
            {user?.vendor_profile?.shop_name || "Shopkeeper Ledger"}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Welcome back, <strong>{user?.name || user?.username}</strong> • Verified Digital Credit Notebook
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
          <Link to="/vendor/create" className="btn-primary" style={{ padding: '9px 18px' }}>
            <PlusCircle size={16} />
            <span>Create Credit Entry</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Outstanding Credit */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Outstanding Credit
            </span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '6px', borderRadius: '8px' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>
            ₹{summary ? Number(summary.total_outstanding).toLocaleString() : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Owed by customers across accepted entries
          </div>
        </div>

        {/* Total Collected */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Recovered / Settled
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399' }}>
            ₹{summary ? Number(summary.total_collected).toLocaleString() : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Payments collected & deposited
          </div>
        </div>

        {/* Pending Customer Verifications */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Verification
            </span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px', borderRadius: '8px' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818cf8' }}>
            {summary?.counts?.pending || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>entries</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Waiting for customer QR scan & approval
          </div>
        </div>

        {/* Disputed Entries */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Disputed Entries
            </span>
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '6px', borderRadius: '8px' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fb7185' }}>
            {summary?.counts?.disputed || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>bills</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Customer requested bill adjustment
          </div>
        </div>
      </div>

      {/* Customer Balances Quick Breakdown */}
      {summary?.customers && summary.customers.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#34d399" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Customer Credit Balances</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {summary.customers.length} registered customers
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {summary.customers.map((cust, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cust.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {cust.phone} • {cust.total_transactions} txns
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: Number(cust.outstanding_balance) > 0 ? '#fbbf24' : '#34d399'
                  }}>
                    ₹{Number(cust.outstanding_balance).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>outstanding</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              Transaction Register
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live synchronized transactions with customer verification status
            </p>
          </div>

          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search customer, item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}>
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'PENDING', label: `Pending (${summary?.counts?.pending || 0})` },
            { id: 'ACCEPTED', label: `Accepted (${summary?.counts?.accepted || 0})` },
            { id: 'DISPUTED', label: `Disputed (${summary?.counts?.disputed || 0})` },
            { id: 'PAID', label: `Paid (${summary?.counts?.paid || 0})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab.id ? '#34d399' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction Table / Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Loading ledger transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Layers size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>No transactions found</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
              {activeTab === 'ALL' ? "You haven't recorded any credit entries yet." : `No entries with status '${activeTab}'.`}
            </p>
            <Link to="/vendor/create" className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px' }}>
              <PlusCircle size={15} />
              <span>Record First Credit</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTransactions.map(tx => (
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
                  gap: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Left Info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>#{tx.id}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{tx.customer_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({tx.customer_phone})</span>
                    <StatusBadge status={tx.status} size="sm" />
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    {tx.description || 'Credit Entry'}
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
                      <strong>Customer Dispute:</strong> {tx.dispute_reason}
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Created on {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Amount and Balance */}
                <div style={{ textAlign: 'right', minWidth: '130px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    ₹{tx.amount}
                  </div>
                  {tx.status === 'ACCEPTED' && (
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                      Bal: ₹{tx.remaining_balance}
                    </div>
                  )}
                  {Number(tx.total_paid) > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                      Paid: ₹{tx.total_paid}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {tx.status === 'PENDING' && (
                    <button
                      onClick={() => setSelectedTxForQR(tx)}
                      className="btn-primary"
                      style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                      title="Show QR Code for Customer"
                    >
                      <QrCode size={14} />
                      <span>Show QR</span>
                    </button>
                  )}

                  {tx.status === 'ACCEPTED' && (
                    <>
                      <button
                        onClick={() => setSelectedTxForPayment(tx)}
                        className="btn-primary"
                        style={{ padding: '7px 12px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                        title="Record Payment"
                      >
                        <CreditCard size={14} />
                        <span>Settle</span>
                      </button>
                      <button
                        onClick={() => setSelectedTxForReminder(tx)}
                        className="btn-secondary"
                        style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                        title="Send Reminder"
                      >
                        <Bell size={14} color="#fbbf24" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTxForQR && (
        <QRModal 
          transaction={selectedTxForQR} 
          onClose={() => setSelectedTxForQR(null)} 
        />
      )}

      {selectedTxForPayment && (
        <PaymentModal 
          transaction={selectedTxForPayment} 
          onClose={() => setSelectedTxForPayment(null)} 
          onSuccess={fetchData}
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
