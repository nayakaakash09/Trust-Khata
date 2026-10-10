import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Store, 
  IndianRupee, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  User,
  Phone,
  HelpCircle
} from 'lucide-react';

export default function VerifyTransaction() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, quickLoginAs } = useAuth();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const data = await api.transactions.verify(token);
      setTransaction(data);
    } catch (err) {
      setError(err.message || 'Unable to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [token]);

  const handleRespond = async (action) => {
    if (!isAuthenticated) {
      // Auto login as demo customer if testing
      await quickLoginAs('customer1');
    }

    if (action === 'DISPUTE' && !disputeReason.trim()) {
      alert('Please enter a reason for disputing this entry.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.transactions.respond(token, action, disputeReason.trim());
      setTransaction(res.transaction);
      setSuccessMessage(res.message);

      if (action === 'ACCEPT') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update transaction status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '540px', margin: '60px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading bill verification details...
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div style={{ maxWidth: '540px', margin: '40px auto', padding: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#fb7185" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Invalid or Expired Link</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {error || 'This transaction token could not be verified.'}
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 20px' }}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPending = transaction.status === 'PENDING';

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '32px 16px' }}>
      <button 
        onClick={() => navigate(user?.role === 'VENDOR' ? '/vendor' : '/customer')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Digital Bill Card */}
      <div className="glass-panel" style={{
        padding: '32px',
        position: 'relative',
        border: isPending ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
        boxShadow: isPending ? 'var(--shadow-glow)' : 'var(--shadow-card)'
      }}>
        {/* Verification Header Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '6px',
              borderRadius: '8px'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', color: '#34d399', textTransform: 'uppercase' }}>
                Trust Khata Digital Bill
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Tx #{transaction.id}
              </div>
            </div>
          </div>

          <StatusBadge status={transaction.status} />
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Merchant & Customer Info */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Shop / Vendor
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginTop: '2px' }}>
              {transaction.shop_name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {transaction.vendor_name} ({transaction.vendor_phone})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Customer Billed
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginTop: '2px' }}>
              {transaction.customer_name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {transaction.customer_phone}
            </div>
          </div>
        </div>

        {/* Amount Box */}
        <div style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Credit Amount Proposed
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>
            ₹{transaction.amount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Recorded on {new Date(transaction.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Description / Items */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            Items / Bill Details:
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.9rem',
            color: '#e2e8f0',
            lineHeight: 1.6
          }}>
            {transaction.description || 'General store credit purchases'}
          </div>
        </div>

        {/* Existing Dispute Reason display */}
        {transaction.status === 'DISPUTED' && transaction.dispute_reason && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#fb7185'
          }}>
            <strong>Recorded Dispute Reason:</strong> {transaction.dispute_reason}
          </div>
        )}

        {/* Existing Payments display */}
        {transaction.payments && transaction.payments.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
              Settlement Records (Paid ₹{transaction.total_paid} / ₹{transaction.amount}):
            </div>
            {transaction.payments.map((p, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>₹{p.amount_paid} via {p.payment_mode} {p.notes ? `(${p.notes})` : ''}</span>
                <span style={{ color: 'var(--text-dim)' }}>{new Date(p.payment_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Customer Actions (If Pending) */}
        {isPending ? (
          <div>
            {!showDisputeInput ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleRespond('ACCEPT')}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '14px', fontSize: '1rem' }}
                >
                  <CheckCircle size={18} />
                  <span>{submitting ? 'Verifying...' : 'Accept Credit Entry'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDisputeInput(true)}
                  disabled={submitting}
                  className="btn-danger"
                  style={{ padding: '14px', fontSize: '0.95rem' }}
                >
                  <AlertTriangle size={18} />
                  <span>Dispute Entry</span>
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Explain Dispute to Shopkeeper
                </div>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Price was ₹350 not ₹420, item not received, or already paid cash at counter..."
                  style={{ marginBottom: '12px' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowDisputeInput(false)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond('DISPUTE')}
                    disabled={submitting}
                    className="btn-danger"
                    style={{ flex: 1.5 }}
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Dispute'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              This transaction has already been verified and locked.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
