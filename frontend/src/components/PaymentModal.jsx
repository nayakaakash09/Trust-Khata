import React, { useState } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, CheckCircle, IndianRupee, CreditCard, Banknote, HelpCircle } from 'lucide-react';

export default function PaymentModal({ transaction, onClose, onSuccess }) {
  const [amountPaid, setAmountPaid] = useState(transaction?.remaining_balance || '');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!transaction) return null;

  const remaining = Number(transaction.remaining_balance || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amountPaid);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }
    if (val > remaining) {
      setError(`Payment cannot exceed the remaining balance of ₹${remaining}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.transactions.recordPayment(transaction.id, {
        amount_paid: val,
        payment_mode: paymentMode,
        notes: notes.trim()
      });

      if (val >= remaining) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const previewRemaining = Math.max(0, remaining - (parseFloat(amountPaid) || 0));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        onClick={e => e.stopPropagation()} 
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
          Record Payment
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Tx #{transaction.id} • {transaction.customer_name}
        </p>

        {/* Balance cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Balance</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>₹{remaining}</div>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>After Payment</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: previewRemaining === 0 ? '#34d399' : '#60a5fa' }}>
              ₹{previewRemaining.toFixed(2)}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Payment Amount (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }}>₹</span>
              <input 
                type="number"
                step="0.01"
                max={remaining}
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px', fontSize: '1.05rem', fontWeight: 700 }}
                placeholder="0.00"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button 
                type="button" 
                onClick={() => setAmountPaid(remaining)} 
                style={{ fontSize: '0.75rem', color: '#34d399', textDecoration: 'underline' }}
              >
                Full Settle (₹{remaining})
              </button>
              {remaining > 500 && (
                <button 
                  type="button" 
                  onClick={() => setAmountPaid(Math.round(remaining / 2))} 
                  style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'underline' }}
                >
                  Pay Half (₹{Math.round(remaining / 2)})
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Payment Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI App', icon: CreditCard },
                { id: 'OTHER', label: 'Other', icon: HelpCircle }
              ].map(mode => {
                const Icon = mode.icon;
                const isSelected = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#10b981' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                      color: isSelected ? '#34d399' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Icon size={16} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="form-label">Note / Reference (Optional)</label>
            <input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="form-input"
              placeholder="e.g. Paid via GPay / Handed at shop"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn-primary" 
              style={{ flex: 1.5 }}
            >
              <CheckCircle size={16} />
              <span>{submitting ? 'Recording...' : 'Confirm Settle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
