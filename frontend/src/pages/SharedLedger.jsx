import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Layers, ShieldCheck, Search, Filter, IndianRupee, Clock, ArrowDownLeft, ArrowUpRight, CheckCheck } from 'lucide-react';

export default function SharedLedger() {
  const { user, role } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await api.transactions.list({ search, status: statusFilter });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load shared ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [search, statusFilter]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
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

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '200px', padding: '9px 12px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Loading ledger synchronized ledger data...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No ledger entries matching criteria.
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
                      <div style={{ fontWeight: 600 }}>{tx.customer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{tx.customer_phone}</div>
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
                      ₹{tx.amount}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                      ₹{tx.total_paid}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: Number(tx.remaining_balance) > 0 ? '#fbbf24' : '#94a3b8' }}>
                      ₹{tx.remaining_balance}
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
