import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, Camera, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [pendingTxns, setPendingTxns] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Load pending transactions for current user to enable 1-click verification
    api.transactions.list({ status: 'PENDING' })
      .then(list => setPendingTxns(list || []))
      .catch(() => {});
  }, []);

  const handleResolveCode = (code) => {
    const raw = (code || manualCode).trim();
    if (!raw) return;

    // Check if user entered URL or raw token or 'trustkhata:tx:<token>'
    let token = raw;
    if (raw.includes('/verify/')) {
      const parts = raw.split('/verify/');
      token = parts[1].split('?')[0].split('#')[0];
    } else if (raw.startsWith('trustkhata:tx:')) {
      token = raw.replace('trustkhata:tx:', '');
    }

    navigate(`/verify/${token}`);
  };

  const startCamera = async () => {
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setScanError('Unable to access camera. You can paste the code or use 1-click below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <QrCode size={28} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Scan Shopkeeper QR Code
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Scan the QR displayed on the shopkeeper's phone or counter to review and accept the credit entry.
        </p>

        {/* Camera Scanner Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          height: '240px',
          margin: '0 auto 24px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#090d16',
          border: '2px dashed var(--border-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ padding: '20px' }}>
              <Camera size={38} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                Camera is off
              </div>
              <button onClick={startCamera} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Start Camera
              </button>
            </div>
          )}
        </div>

        {scanError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '20px'
          }}>
            {scanError}
          </div>
        )}

        {/* Manual Code / Link Input */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px'
        }}>
          <label className="form-label">Or Paste Transaction Code / Link</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. 7de26c7c-9bd8-4053... or verification link"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              className="form-input"
            />
            <button
              onClick={() => handleResolveCode()}
              disabled={!manualCode.trim()}
              className="btn-primary"
              style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
            >
              Verify
            </button>
          </div>
        </div>

        {/* Pending Bills Direct Quick Test */}
        {pendingTxns.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#34d399',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              <Sparkles size={14} />
              <span>Your Pending Bills Ready For Verification (1-Click)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingTxns.map(tx => (
                <button
                  key={tx.id}
                  onClick={() => handleResolveCode(tx.secure_token)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#fff',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {tx.shop_name} • ₹{tx.amount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.description}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#34d399',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    <span>Verify Bill</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
