import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Copy, Check, ExternalLink, ShieldAlert, Sparkles, Smartphone } from 'lucide-react';

export default function QRModal({ transaction, onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { quickLoginAs } = useAuth();

  if (!transaction) return null;

  const verifyUrl = `${window.location.origin}/verify/${transaction.secure_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = async () => {
    onClose();
    // Quick login as demo customer Rahul Verma
    await quickLoginAs('customer1');
    navigate(`/verify/${transaction.secure_token}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        onClick={e => e.stopPropagation()} 
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          textAlign: 'center'
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
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={13} />
          <span>VERIFICATION QR CODE</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
          Customer Verification QR
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Ask customer <strong>{transaction.customer_name}</strong> to scan this code with their phone camera to confirm the credit entry.
        </p>

        {/* QR Code Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          display: 'inline-block',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          marginBottom: '20px'
        }}>
          {transaction.qr_code ? (
            <img 
              src={transaction.qr_code} 
              alt="Verification QR Code" 
              style={{ width: '220px', height: '220px', display: 'block' }}
            />
          ) : (
            <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
              QR Code Ready
            </div>
          )}
        </div>

        {/* Bill summary preview */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px',
          textAlign: 'left',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
            <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>₹{transaction.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
            <span style={{ fontWeight: 600 }}>{transaction.customer_name} ({transaction.customer_phone})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Description:</span>
            <span style={{ fontWeight: 500, color: '#cbd5e1' }}>{transaction.description || 'Credit Entry'}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={handleCopyLink} 
            className="btn-secondary" 
            style={{ width: '100%', padding: '10px' }}
          >
            {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            <span>{copied ? "Verification Link Copied!" : "Copy Verification Link"}</span>
          </button>

          <button 
            onClick={handleSimulateScan}
            className="btn-primary" 
            style={{ width: '100%', padding: '10px' }}
          >
            <Smartphone size={16} />
            <span>Simulate Customer Verification (1-Click)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
