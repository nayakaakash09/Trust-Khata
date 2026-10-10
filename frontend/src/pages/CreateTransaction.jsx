import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import QRModal from '../components/QRModal';
import { PlusCircle, User, Phone, IndianRupee, FileText, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CreateTransaction() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTransaction, setCreatedTransaction] = useState(null);

  useEffect(() => {
    // Load registered customers for rapid autofill
    api.auth.getCustomers()
      .then(list => setCustomers(list || []))
      .catch(() => {});
  }, []);

  const handleSelectCustomer = (e) => {
    const cId = e.target.value;
    setSelectedCustomerId(cId);
    if (!cId) {
      setCustomerName('');
      setCustomerPhone('');
      return;
    }
    const found = customers.find(c => String(c.id) === String(cId));
    if (found) {
      setCustomerName(found.name || found.username);
      setCustomerPhone(found.phone || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (!customerPhone.trim()) {
      setError('Please provide a valid customer phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.transactions.create({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        amount: val,
        description: description.trim()
      });

      // Show generated QR Modal immediately!
      setCreatedTransaction(res);
    } catch (err) {
      setError(err.message || 'Failed to create credit transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
      <button 
        onClick={() => navigate('/vendor')} 
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
        <span>Back to Shop Dashboard</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '6px',
            borderRadius: '8px'
          }}>
            <PlusCircle size={20} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Record Credit Transaction</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Enter transaction details to issue digital credit. A verification QR will be generated instantly for the customer to confirm.
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quick Autocomplete Dropdown */}
          {customers.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Quick Select Existing Customer</label>
              <select
                value={selectedCustomerId}
                onChange={handleSelectCustomer}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- Choose Customer or Enter New Below --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.username} ({c.phone || 'No phone'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="form-input"
                placeholder="e.g. Rahul Verma"
                required
              />
            </div>
            <div>
              <label className="form-label">Customer Mobile</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="form-input"
                placeholder="e.g. 9812345678"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Credit Amount (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '10px', color: '#34d399', fontWeight: 800, fontSize: '1.2rem' }}>₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px', fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Items / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-input"
              placeholder="e.g. Milk 2L, Bread 1pkt, Eggs 6pcs, Cooking Oil"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            <Sparkles size={18} />
            <span>{loading ? 'Creating Transaction & QR...' : 'Create Credit & Generate QR Code'}</span>
          </button>
        </form>
      </div>

      {/* QR Modal upon successful creation */}
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
