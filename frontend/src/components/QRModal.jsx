import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Copy, 
  Check, 
  IndianRupee, 
  Sparkles, 
  Smartphone, 
  UserCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function QRModal({ transaction, onClose }) {
  const [liveTx, setLiveTx] = useState(transaction);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [acceptedCelebrated, setAcceptedCelebrated] = useState(false);
  const navigate = useNavigate();
  const { quickLoginAs } = useAuth();

  const token = liveTx?.secure_token || transaction?.secure_token;
  const verifyUrl = `${window.location.origin}/verify/${token}`;

  // Poll and listen to cross-device events to detect live scan and acceptance
  useEffect(() => {
    if (!token) return;

    const cleanToken = String(token).replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
    let es = null;
    try {
      es = new EventSource(`https://ntfy.sh/tk_tx_${cleanToken}/sse`);
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === 'message' && msg.message) {
            const payload = JSON.parse(msg.message);
            setLiveTx(prev => {
              const updated = { ...prev, ...payload };
              if (payload.status === 'ACCEPTED' && (!prev || prev.status !== 'ACCEPTED')) {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 }
                });
                setAcceptedCelebrated(true);
              }
              return updated;
            });
          }
        } catch (err) {}
      };
    } catch (e) {}

    const interval = setInterval(async () => {
      try {
        const updated = await api.transactions.verify(token);
        setLiveTx(prev => {
          // If transaction status changed to ACCEPTED, fire confetti!
          if (updated.status === 'ACCEPTED' && (!prev || prev.status !== 'ACCEPTED')) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
            setAcceptedCelebrated(true);
          }
          return updated;
        });
      } catch (e) {
        // Ignore polling network glitches
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      if (es) {
        try { es.close(); } catch (e) {}
      }
    };
  }, [token]);


  if (!liveTx) return null;

  const isCustomerAttached = Boolean(liveTx.customer || liveTx.customer_name);
  const isAccepted = liveTx.status === 'ACCEPTED';
  const isPending = liveTx.status === 'PENDING';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click Simulation: Simulates Rahul Verma scanning the QR code
  const handleSimulateScan = async () => {
    setSimulating(true);
    try {
      // Login as Rahul Verma and claim bill
      await quickLoginAs('customer1');
      const claimRes = await api.transactions.claim(token);
      setLiveTx(claimRes.transaction);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // 1-Click Customer Acceptance simulation
  const handleSimulateAccept = async () => {
    setSimulating(true);
    try {
      await quickLoginAs('customer1');
      const res = await api.transactions.respond(token, 'ACCEPT');
      setLiveTx(res.transaction);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setAcceptedCelebrated(true);
    } catch (err) {
      alert(err.message || 'Failed to accept bill');
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenCustomerScreen = () => {
    onClose();
    navigate(`/verify/${token}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="kb-card" 
        onClick={e => e.stopPropagation()} 
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          border: isAccepted ? '2px solid #10b981' : isCustomerAttached ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)'
          }}
        >
          <X size={18} />
        </button>

        {/* Status Header Badge */}
        <div style={{ marginBottom: '14px' }}>
          {isAccepted ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <CheckCircle2 size={16} />
              <span>BILL CONFIRMED & ADDED TO KHATA</span>
            </div>
          ) : isCustomerAttached ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <UserCheck size={16} />
              <span>CUSTOMER SCANNED — REVIEWING BILL</span>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid #f59e0b',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#fbbf24',
                display: 'inline-block'
              }} className="radar-pulse-ring" />
              <span>WAITING FOR CUSTOMER SCAN...</span>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '4px' }}>
          {liveTx.shop_name || 'Sharma Kirana Store'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Instant Khatabook Credit Bill
        </p>

        {/* QR Code Container */}
        <div style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '20px'
        }}>
          {!isCustomerAttached && !isAccepted && (
            <div 
              className="radar-pulse-ring"
              style={{
                position: 'absolute',
                inset: '-10px',
                border: '2px dashed rgba(245, 158, 11, 0.5)',
                borderRadius: '24px',
                pointerEvents: 'none'
              }}
            />
          )}

          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '16px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
            border: isAccepted ? '3px solid #10b981' : '3px solid #0f172a'
          }}>
            {liveTx.qr_code ? (
              <img 
                src={liveTx.qr_code} 
                alt="Credit Bill QR" 
                style={{ width: '210px', height: '210px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Generating QR...
              </div>
            )}
          </div>

          {isAccepted && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(16, 185, 129, 0.92)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              padding: '16px'
            }}>
              <CheckCircle2 size={54} />
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '8px' }}>
                Khata Verified!
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                Added to Ledger
              </div>
            </div>
          )}
        </div>

        {/* Bill Summary Strip */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bill Amount:</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
              ₹{Number(liveTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Products:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', textAlign: 'right' }}>
              {liveTx.description || 'Credit Goods'}
            </span>
          </div>
        </div>

        {/* REAL-TIME DETECTED CUSTOMER CARD */}
        {isCustomerAttached ? (
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div className="kb-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                {(liveTx.customer_name || 'C').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                  {liveTx.customer_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                  📱 {liveTx.customer_phone || 'Registered Customer'}
                </div>
              </div>
              <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Matched ✓
              </span>
            </div>

            {liveTx.customer_previous_balance && Number(liveTx.customer_previous_balance) > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#f87171' }}>Previous Khata Balance:</span>
                <strong style={{ color: '#f87171' }}>₹{Number(liveTx.customer_previous_balance).toLocaleString()} (You'll Get)</strong>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '0.82rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>Show this QR to the customer. When they scan, their name & Khata profile will appear here instantly!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isAccepted ? (
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <Check size={18} />
              <span>Done • View in Khatabook Ledger</span>
            </button>
          ) : (
            <>
              {/* Copy link */}
              <button 
                onClick={handleCopyLink} 
                className="btn-secondary" 
                style={{ width: '100%', padding: '10px' }}
              >
                {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                <span>{copied ? "Verification Link Copied!" : "Copy Bill Link"}</span>
              </button>

              {/* Prominent customer launcher for instant 1-click test */}
              <button
                onClick={handleOpenCustomerScreen}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px 18px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={16} />
                <span>Open Customer Screen to Verify & Add to Khata →</span>
              </button>

              {/* 1-Click In-Modal Simulation Buttons */}
              {!isCustomerAttached ? (
                <button
                  onClick={handleSimulateScan}
                  disabled={simulating}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Smartphone size={16} />
                  <span>{simulating ? 'Connecting...' : '⚡ Simulate Customer Scan (Rahul Verma)'}</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateAccept}
                  disabled={simulating}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '11px 16px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{simulating ? 'Accepting...' : '⚡ 1-Click Confirm & Accept as Rahul'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
