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
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  User,
  Phone,
  HelpCircle,
  ShoppingBag,
  Zap,
  Check,
  X
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

  const fetchAndClaim = async () => {
    setLoading(true);
    try {
      // 1. Fetch transaction
      const data = await api.transactions.verify(token);
      
      // 2. If customer is authenticated and transaction not yet linked, claim it!
      if (isAuthenticated && user?.role === 'CUSTOMER' && !data.customer) {
        const claimRes = await api.transactions.claim(token);
        setTransaction(claimRes.transaction);
      } else {
        setTransaction(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndClaim();
  }, [token, isAuthenticated]);

  const handleQuickCustomerLogin = async () => {
    try {
      await quickLoginAs('customer1');
      // fetchAndClaim will trigger on isAuthenticated change
    } catch (e) {
      alert('Login failed');
    }
  };

  const handleRespond = async (action) => {
    if (!isAuthenticated) {
      // Auto login as demo customer Rahul Verma
      await quickLoginAs('customer1');
    }

    if (action === 'DISPUTE' && !disputeReason.trim()) {
      alert('Please enter a reason for disputing this bill entry.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.transactions.respond(token, action, disputeReason.trim());
      setTransaction(res.transaction);
      setSuccessMessage(res.message);

      if (action === 'ACCEPT') {
        confetti({
          particleCount: 120,
          spread: 80,
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
        <Clock size={36} className="radar-pulse-ring" style={{ margin: '0 auto 12px', color: '#38bdf8' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Khatabook Bill Receipt...</div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div style={{ maxWidth: '540px', margin: '40px auto', padding: '24px' }}>
        <div className="kb-card" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={44} color="#f87171" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Bill Not Found or Expired</h3>
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
  const isAccepted = transaction.status === 'ACCEPTED';
  const isDisputed = transaction.status === 'DISPUTED';

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>
      <button 
        onClick={() => navigate(user?.role === 'VENDOR' ? '/vendor' : '/customer')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '18px'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Ledger</span>
      </button>

      {/* Auth helper for demo if not logged in */}
      {!isAuthenticated && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            Not logged in? Connect as demo customer <strong>Rahul Verma</strong> to sync to your Khata.
          </div>
          <button
            onClick={handleQuickCustomerLogin}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', flexShrink: 0 }}
          >
            Connect as Rahul
          </button>
        </div>
      )}

      {/* DIGITAL RECEIPT CARD */}
      <div 
        className="kb-card" 
        style={{
          padding: '32px 28px',
          border: isAccepted ? '2px solid #10b981' : isPending ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
          position: 'relative'
        }}
      >
        {/* Receipt Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 12px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
          }}>
            <Store size={26} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {transaction.shop_name || "Sharma Kirana Store"}
          </h2>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>Merchant: {transaction.vendor_name}</span>
            <span>•</span>
            <span>📱 {transaction.vendor_phone || '9876543210'}</span>
          </div>

          <div style={{ marginTop: '10px' }}>
            <StatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Bill Big Amount */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CREDIT AMOUNT REQUESTED
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
            ₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Itemised Breakdown */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
            ITEMS / PRODUCTS PURCHASED
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '14px 16px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#e2e8f0',
            lineHeight: '1.5'
          }}>
            {transaction.description || 'General Grocery & Provisions'}
          </div>
        </div>

        {/* Customer Identity Sync Status */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="kb-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              {(transaction.customer_name || user?.name || 'C').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Customer: {transaction.customer_name || user?.name || 'Connecting...'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                📱 {transaction.customer_phone || user?.phone || 'Linked via Trust Khata'}
              </div>
            </div>
          </div>

          <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            ✓ Verified
          </span>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            🎉 {successMessage}
          </div>
        )}

        {/* Customer Action Buttons if PENDING */}
        {isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleRespond('ACCEPT')}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={20} />
              <span>{submitting ? 'Confirming...' : 'Accept & Add to Khata'}</span>
            </button>

            {!showDisputeInput ? (
              <button
                onClick={() => setShowDisputeInput(true)}
                style={{
                  color: '#f87171',
                  background: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={15} />
                <span>Wrong amount or items? Dispute this entry</span>
              </button>
            ) : (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                padding: '12px',
                marginTop: '6px'
              }}>
                <textarea
                  rows="2"
                  className="form-input"
                  placeholder="Enter reason for dispute (e.g. wrong amount, did not purchase)..."
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleRespond('DISPUTE')}
                    disabled={submitting || !disputeReason.trim()}
                    className="btn-danger"
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                  >
                    Submit Dispute
                  </button>
                  <button
                    onClick={() => setShowDisputeInput(false)}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isAccepted && (
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/customer"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center' }}
            >
              <span>View in My Customer Khata Book</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
