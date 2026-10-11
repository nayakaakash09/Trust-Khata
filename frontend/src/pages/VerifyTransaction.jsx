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
  const [selectedCustomer, setSelectedCustomer] = useState('rahul_v'); // 'rahul_v' or 'priya_s'

  const fetchAndClaim = async () => {
    setLoading(true);
    setError('');
    const cleanToken = (token || '').trim();
    try {
      // 1. Fetch transaction
      const data = await api.transactions.verify(cleanToken);
      
      // 2. If customer is authenticated and transaction not yet linked, claim it!
      if (isAuthenticated && user?.role === 'CUSTOMER') {
        if (!data.customer || !data.customer_name) {
          const claimRes = await api.transactions.claim(cleanToken, {
            customer: user.id,
            customer_name: user.name,
            customer_phone: user.phone
          });
          setTransaction(claimRes.transaction);
        } else {
          setTransaction(data);
        }
      } else {
        setTransaction(data);
      }
    } catch (err) {
      console.warn('Verify transaction error:', err);
      setError(err.message || 'Unable to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndClaim();
  }, [token, isAuthenticated]);

  const handleSelectCustomer = async (custKey) => {
    setSelectedCustomer(custKey);
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      await quickLoginAs(custKey === 'rahul_v' ? 'customer1' : 'customer2');
    }
  };

  const handleRespond = async (action) => {
    let activeCustomer = user;
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      // Ensure session is set to the customer so ProtectedRoute permits /customer
      activeCustomer = await quickLoginAs(selectedCustomer === 'priya_s' ? 'customer2' : 'customer1');
    }

    if (action === 'DISPUTE' && !disputeReason.trim()) {
      alert('Please enter a reason for disputing this bill entry.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanToken = (token || '').trim();
      const custName = activeCustomer?.name || (selectedCustomer === 'priya_s' ? 'Priya Sharma' : 'Rahul Verma');
      const custPhone = activeCustomer?.phone || (selectedCustomer === 'priya_s' ? '9876543211' : '9812345678');
      const custId = activeCustomer?.id || (selectedCustomer === 'priya_s' ? 3 : 2);

      // Link to customer
      await api.transactions.claim(cleanToken, {
        customer: custId,
        customer_name: custName,
        customer_phone: custPhone
      });

      const res = await api.transactions.respond(cleanToken, action, disputeReason.trim());
      setTransaction(res.transaction);
      setSuccessMessage(res.message);

      if (action === 'ACCEPT') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update transaction status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToCustomerDashboard = async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      await quickLoginAs(selectedCustomer === 'priya_s' ? 'customer2' : 'customer1');
    }
    navigate('/customer');
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

  const displayCustName = transaction.customer_name || (user?.role === 'CUSTOMER' ? user.name : (selectedCustomer === 'priya_s' ? 'Priya Sharma' : 'Rahul Verma'));
  const displayCustPhone = transaction.customer_phone || (user?.role === 'CUSTOMER' ? user.phone : (selectedCustomer === 'priya_s' ? '9876543211' : '9812345678'));

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <button 
          onClick={() => navigate(user?.role === 'VENDOR' ? '/vendor' : '/customer')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Ledger</span>
        </button>

        <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          Digital QR Bill
        </span>
      </div>

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
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 12px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
          }}>
            <Store size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {transaction.shop_name || "Sharma Kirana & General Store"}
          </h2>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>Merchant: {transaction.vendor_name || 'Ramesh Sharma'}</span>
            <span>•</span>
            <span>📱 {transaction.vendor_phone || '9876543210'}</span>
          </div>

          <div style={{ marginTop: '12px' }}>
            <StatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Bill Big Amount */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '22px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CREDIT AMOUNT REQUESTED
          </span>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#34d399', marginTop: '4px', letterSpacing: '-0.02em' }}>
            ₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Itemised Breakdown */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
            PURCHASED PRODUCTS / ITEMS
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#e2e8f0',
            lineHeight: '1.5'
          }}>
            🛒 {transaction.description || 'General Grocery & Provisions'}
          </div>
        </div>

        {/* Customer Account Selection & Identity Sync */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isPending ? '12px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="kb-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                {displayCustName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  {displayCustName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                  📱 {displayCustPhone}
                </div>
              </div>
            </div>

            <span className="kb-pill" style={{ background: isAccepted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: isAccepted ? '#34d399' : '#38bdf8' }}>
              {isAccepted ? '✓ Linked to Khata' : 'Target Account'}
            </span>
          </div>

          {/* Quick Persona selector if bill is pending */}
          {isPending && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Select customer account to attach this bill:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectCustomer('rahul_v')}
                  style={{
                    background: selectedCustomer === 'rahul_v' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${selectedCustomer === 'rahul_v' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '8px',
                    color: selectedCustomer === 'rahul_v' ? '#93c5fd' : '#cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div>Rahul Verma</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>9812345678</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCustomer('priya_s')}
                  style={{
                    background: selectedCustomer === 'priya_s' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${selectedCustomer === 'priya_s' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '8px',
                    color: selectedCustomer === 'priya_s' ? '#93c5fd' : '#cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div>Priya Sharma</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>9876543211</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#34d399',
            fontSize: '0.92rem',
            fontWeight: 800,
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
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <CheckCircle2 size={22} />
              <span>{submitting ? 'Adding to Khata...' : `Accept & Add to ${displayCustName.split(' ')[0]}'s Khata`}</span>
            </button>

            {!showDisputeInput ? (
              <button
                onClick={() => setShowDisputeInput(true)}
                style={{
                  color: '#f87171',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
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

        {/* Actions if ACCEPTED: Prominent Customer Dashboard Redirection */}
        {isAccepted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
            <button
              onClick={handleGoToCustomerDashboard}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={20} />
              <span>Go to Customer Dashboard (My Khata) →</span>
            </button>

            <Link
              to={`/ledger?phone=${displayCustPhone}`}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
            >
              <FileText size={15} />
              <span>View in Synchronized Shared Ledger</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
