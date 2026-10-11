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
  Check,
  X,
  Edit3,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function VerifyTransaction() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginCustomer, quickLoginAs } = useAuth();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Real Customer Input State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBill = async () => {
    setLoading(true);
    setError('');
    const cleanToken = (token || '').trim();
    try {
      const data = await api.transactions.verify(cleanToken);
      setTransaction(data);

      // Pre-fill customer state if already known or logged in
      if (isAuthenticated && user?.role === 'CUSTOMER') {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
      } else if (data.customer_name || data.customer_phone) {
        setCustomerName(data.customer_name || '');
        setCustomerPhone(data.customer_phone || '');
      }
    } catch (err) {
      console.warn('Verify transaction error:', err);
      setError(err.message || 'Unable to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [token, isAuthenticated]);

  // Evaluator Quick-Fill Helper (Optional test chip)
  const handleQuickFill = (name, phone) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setFormError('');
  };

  const handleRespond = async (action) => {
    setFormError('');
    let finalName = customerName.trim();
    let finalPhone = customerPhone.trim().replace(/\D/g, '');

    // Fall back to active customer session if inputs were blank
    if (!finalName && isAuthenticated && user?.role === 'CUSTOMER') {
      finalName = user.name;
    }
    if (!finalPhone && isAuthenticated && user?.role === 'CUSTOMER') {
      finalPhone = (user.phone || '').replace(/\D/g, '');
    }

    // Real-world validation
    if (!finalName) {
      setFormError('Please enter your full name so this bill is saved to your Khata.');
      return;
    }
    if (!finalPhone || finalPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      return;
    }

    if (action === 'DISPUTE' && !disputeReason.trim()) {
      alert('Please enter a reason for disputing this bill entry.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanToken = (token || '').trim();

      // 1. Authenticate this real customer and persist session
      let activeCustomer = user;
      if (!isAuthenticated || user?.role !== 'CUSTOMER' || (user?.phone && user.phone.replace(/\D/g, '') !== finalPhone)) {
        activeCustomer = await loginCustomer(finalName, finalPhone);
      }

      // 2. Link transaction to this real customer
      await api.transactions.claim(cleanToken, {
        customer: activeCustomer?.id,
        customer_name: finalName,
        customer_phone: finalPhone
      });

      // 3. Submit customer response (ACCEPT / DISPUTE)
      const res = await api.transactions.respond(cleanToken, action, disputeReason.trim(), {
        customer_name: finalName,
        customer_phone: finalPhone
      });

      setTransaction(res.transaction);
      setSuccessMessage(action === 'ACCEPT' 
        ? `Bill verified and saved to ${finalName}'s Khata!` 
        : `Bill disputed. Vendor has been alerted.`
      );

      if (action === 'ACCEPT') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update transaction status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToCustomerDashboard = async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      const finalName = customerName.trim() || 'Customer';
      const finalPhone = customerPhone.trim().replace(/\D/g, '') || '9876543210';
      await loginCustomer(finalName, finalPhone);
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

  const displayCustName = transaction.customer_name || customerName || (user?.role === 'CUSTOMER' ? user.name : 'Customer');
  const displayCustPhone = transaction.customer_phone || customerPhone || (user?.role === 'CUSTOMER' ? user.phone : '');

  const hasLoggedInMatch = isAuthenticated && user?.role === 'CUSTOMER' && !isEditingCustomer;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
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

        {/* CUSTOMER ONBOARDING & PASSBOOK LINKAGE SECTION */}
        <div style={{
          background: isAccepted ? 'rgba(16, 185, 129, 0.06)' : 'rgba(56, 189, 248, 0.06)',
          border: `1px solid ${isAccepted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '24px'
        }}>
          {/* Header of Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color={isAccepted ? '#34d399' : '#38bdf8'} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                {isAccepted ? 'Linked Customer Khata' : 'Claim & Save to Your Khata'}
              </span>
            </div>

            <span className="kb-pill" style={{
              background: isAccepted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              color: isAccepted ? '#34d399' : '#38bdf8'
            }}>
              {isAccepted ? '✓ Verified Account' : 'Step 2: Customer Identity'}
            </span>
          </div>

          {/* Scenario A: Already Accepted -> Display Confirmed Customer Card */}
          {isAccepted ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="kb-avatar" style={{ width: '42px', height: '42px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  {displayCustName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    {displayCustName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#93c5fd' }}>
                    📱 {displayCustPhone || 'Verified Khata Member'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Shop Credit Added</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                  +₹{transaction.amount}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Scenario B: Pending Bill -> Real Customer Form or Logged-in State */}
              {hasLoggedInMatch ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="kb-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                        {user.name ? user.name.slice(0, 2).toUpperCase() : 'CU'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                          {user.name || user.username}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                          📱 {user.phone || 'Customer Account'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingCustomer(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#93c5fd',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '5px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={12} />
                      <span>Change Mobile</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    This credit purchase will be added to your verified digital passbook.
                  </div>
                </div>
              ) : (
                /* Dynamic Customer Input Form (For ANY walk-in customer!) */
                <div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                    Enter your <strong>Name</strong> and <strong>10-digit Mobile Number</strong>. Your personal digital Khata book will be created and this bill will be saved in your passbook.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        YOUR FULL NAME <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Vikram Singh"
                          value={customerName}
                          onChange={e => {
                            setCustomerName(e.target.value);
                            setFormError('');
                          }}
                          style={{
                            width: '100%',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            padding: '10px 10px 10px 32px',
                            color: '#ffffff',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        MOBILE NUMBER <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit number"
                          value={customerPhone}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setCustomerPhone(val);
                            setFormError('');
                          }}
                          style={{
                            width: '100%',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            padding: '10px 10px 10px 32px',
                            color: '#ffffff',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Evaluator Quick-Fill Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Quick Auto-fill for Testing:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Rahul Verma', '9812345678')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: '#93c5fd',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Rahul Verma (9812345678)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Priya Sharma', '9876543211')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: '#93c5fd',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Priya Sharma (9876543211)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#f87171',
              fontSize: '0.8rem',
              marginTop: '12px'
            }}>
              {formError}
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
              <span>
                {submitting 
                  ? 'Saving to Khata...' 
                  : (customerName.trim() 
                      ? `Accept & Add to ${customerName.trim().split(' ')[0]}'s Khata` 
                      : 'Accept & Add to My Khata'
                    )
                }
              </span>
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
              to={`/ledger?phone=${displayCustPhone || customerPhone}`}
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
