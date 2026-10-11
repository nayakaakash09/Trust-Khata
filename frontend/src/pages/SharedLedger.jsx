import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
  Layers, 
  ShieldCheck, 
  Search, 
  Filter, 
  IndianRupee, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCheck,
  Printer,
  X,
  FileText,
  User
} from 'lucide-react';

export default function SharedLedger() {
  const { user, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || searchParams.get('search') || '';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialPhone);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await api.transactions.list({ search: search.trim(), status: statusFilter });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load shared ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [search, statusFilter]);

  const clearFilter = () => {
    setSearch('');
    setStatusFilter('');
    setSearchParams({});
  };

  const totalCredit = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const totalSettled = transactions.reduce((acc, t) => acc + (parseFloat(t.total_paid) || 0), 0);
  const totalOutstanding = transactions.reduce((acc, t) => acc + (parseFloat(t.remaining_balance) || 0), 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Layers size={22} color="#10b981" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Synchronized Shared Ledger
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Single source of truth mutually verified by merchant and customer. Zero discrepancies.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Print or Save Ledger Statement"
          >
            <Printer size={15} />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div className="kb-card" style={{ padding: '16px 20px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
            TOTAL ENTRIES
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
            {transactions.length}
          </div>
        </div>

        <div className="kb-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
            TOTAL CREDIT VALUE
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
            ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="kb-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
            TOTAL SETTLED
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            ₹{totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="kb-card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
            NET OUTSTANDING DUE
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter controls & Active Filter Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Filter by customer, phone, or items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: '160px', padding: '9px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="ACCEPTED">Accepted Credit</option>
            <option value="PENDING">Pending Approval</option>
            <option value="PAID">Fully Settled</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>

        {search && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '4px 12px',
            borderRadius: '20px',
            color: '#38bdf8',
            fontSize: '0.8rem'
          }}>
            <span>Filtered: <strong>{search}</strong></span>
            <button 
              type="button"
              onClick={clearFilter}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px' }}
              title="Clear Filter"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Loading synchronized ledger entries...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>No Matching Entries Found</div>
            <div style={{ fontSize: '0.82rem' }}>Try clearing the search filter or create a new QR bill.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px' }}>Tx ID</th>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Shop / Merchant</th>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Items & Notes</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Credit Amount</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Paid</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr 
                    key={tx.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px', fontWeight: 700, color: '#94a3b8' }}>#{tx.id}</td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{tx.shop_name}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600 }}>{tx.customer_name || 'Awaiting Scan'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{tx.customer_phone || '-'}</div>
                    </td>
                    <td style={{ padding: '14px', maxWidth: '240px', color: '#cbd5e1' }}>
                      {tx.description}
                      {tx.status === 'DISPUTED' && (
                        <div style={{ fontSize: '0.72rem', color: '#fb7185', marginTop: '2px' }}>
                          Reason: {tx.dispute_reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{Number(tx.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                      ₹{Number(tx.total_paid || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: Number(tx.remaining_balance) > 0 ? '#ef4444' : '#94a3b8' }}>
                      ₹{Number(tx.remaining_balance || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
