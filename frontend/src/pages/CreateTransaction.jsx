import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import QRModal from '../components/QRModal';
import { 
  Zap, 
  IndianRupee, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  Plus, 
  Check,
  Tag
} from 'lucide-react';

export default function CreateTransaction() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTransaction, setCreatedTransaction] = useState(null);

  // Quick amount preset buttons (Khatabook style)
  const amountPresets = [50, 100, 200, 500, 1000, 2000];

  // Quick item tags to quickly build item description
  const itemChips = [
    'Milk & Curd',
    'Atta 5kg',
    'Cooking Oil 1L',
    'Basmati Rice',
    'Sugar 1kg & Tea',
    'Spices & Masala',
    'Biscuits & Snacks',
    'Soap & Detergent'
  ];

  const handleAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleToggleChip = (chip) => {
    if (!description.trim()) {
      setDescription(chip);
    } else if (description.includes(chip)) {
      // Remove chip
      const parts = description.split(', ').filter(p => p.trim() !== chip);
      setDescription(parts.join(', '));
    } else {
      setDescription(`${description}, ${chip}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid bill amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter the product details or items purchased.');
      return;
    }

    setLoading(true);
    try {
      // Vendor enters ONLY amount and product details! No customer details required.
      const res = await api.transactions.create({
        amount: val,
        description: description.trim(),
        customer_name: '',
        customer_phone: ''
      });

      // Show generated live QR Station immediately
      setCreatedTransaction(res);
    } catch (err) {
      setError(err.message || 'Failed to generate credit QR bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
      <button 
        onClick={() => navigate('/vendor')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '20px'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Khatabook Ledger</span>
      </button>

      {/* Main Card */}
      <div className="kb-card" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Quick Bill QR
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No customer entry needed • Just enter amount & products
              </p>
            </div>
          </div>

          <span className="kb-pill" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            1-Step QR Flow
          </span>
        </div>

        {/* Informational Khatabook banner */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <Sparkles size={18} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45' }}>
            <strong style={{ color: '#ffffff' }}>How it works:</strong> Generate this instant bill QR. When your customer scans it on their phone, the app automatically identifies them and syncs the bill to their Khata.
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount Input (Large Khatabook style) */}
          <div style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
              BILL AMOUNT <span style={{ color: '#f87171' }}>*</span>
            </label>
            
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <IndianRupee size={28} />
              </div>

              <input
                type="number"
                step="any"
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '14px',
                  padding: '16px 18px 16px 52px',
                  color: '#ffffff',
                  fontSize: '2rem',
                  fontWeight: 800,
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            {/* Quick Amount Preset Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '4px' }}>
                Quick Add:
              </span>
              {amountPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddAmount(preset)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#93c5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                >
                  <Plus size={12} />
                  <span>₹{preset}</span>
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f87171'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Product Details / Items Input */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
              PRODUCT DETAILS / ITEMS <span style={{ color: '#f87171' }}>*</span>
            </label>

            <textarea
              rows="3"
              className="form-input"
              placeholder="e.g. Atta 5kg, Cooking Oil 1L, Spices, Milk 2 packets..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                fontSize: '0.95rem',
                borderRadius: '12px',
                padding: '12px 14px',
                lineHeight: '1.5'
              }}
            />

            {/* Quick Product Chips */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Tap item chips to quickly add to bill:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {itemChips.map(chip => {
                  const isSelected = description.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleChip(chip)}
                      className={`kb-chip ${isSelected ? 'active' : ''}`}
                    >
                      {isSelected ? <Check size={12} color="#34d399" /> : <Tag size={12} color="#94a3b8" />}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Big CTA Button */}
          <button
            type="submit"
            disabled={loading || !amount || !description.trim()}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: (amount && description.trim()) 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: (amount && description.trim()) ? '0 8px 25px rgba(16, 185, 129, 0.4)' : 'none',
              cursor: (amount && description.trim()) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            <QrCode size={22} />
            <span>{loading ? 'Generating QR Bill...' : 'Generate Bill QR Code'}</span>
          </button>
        </form>
      </div>

      {/* Live QR Station Modal */}
      {createdTransaction && (
        <QRModal
          transaction={createdTransaction}
          onClose={() => {
            setCreatedTransaction(null);
            navigate('/vendor');
          }}
        />
      )}
    </div>
  );
}
