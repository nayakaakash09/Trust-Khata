import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Bell, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ReminderModal({ transaction, onClose, onSuccess }) {
  const [customMsg, setCustomMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [waLink, setWaLink] = useState('');

  if (!transaction) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.notifications.sendReminder(transaction.id, customMsg);
      const cleanPhone = (transaction.customer_phone || '').replace(/\D/g, '');
      const encodedText = encodeURIComponent(res.preview_text);
      const url = `https://wa.me/91${cleanPhone}?text=${encodedText}`;
      setWaLink(url);
      setSentSuccess(true);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      alert(err.message || 'Failed to send reminder');
    } finally {
      setSubmitting(false);
    }
  };

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
          border: '1px solid rgba(245, 158, 11, 0.3)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            padding: '6px',
            borderRadius: '8px'
          }}>
            <Bell size={18} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Credit Payment Reminder
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Send a polite ledger reminder to <strong>{transaction.customer_name}</strong> ({transaction.customer_phone}) for pending amount of <strong>₹{transaction.remaining_balance}</strong>.
        </p>

        {sentSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Reminder Created & Logged!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Notification registered in Trust Khata. You can also send it directly to customer's WhatsApp with one tap:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href={waLink} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary"
                style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}
              >
                <MessageSquare size={16} />
                <span>Open in WhatsApp</span>
              </a>
              <button onClick={onClose} className="btn-secondary">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Custom Reminder Note (Optional)</label>
              <textarea 
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                className="form-input"
                rows={3}
                placeholder="Leave blank to use friendly default template mentioning shop name, amount, and items..."
              />
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Preview Template:</span><br />
              "Namaste {transaction.customer_name}, this is a gentle reminder from {transaction.shop_name} regarding outstanding credit of ₹{transaction.remaining_balance} (Tx #{transaction.id}: {transaction.description}). Kindly settle at your convenience. Thank you!"
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1.5 }}>
                <Send size={15} />
                <span>{submitting ? 'Sending...' : 'Log & Preview'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
