import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  Camera, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Store
} from 'lucide-react';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, quickLoginAs } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [pendingTxns, setPendingTxns] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const videoRef = useRef(null);

  const loadPending = () => {
    // Load pending transactions to enable 1-click verification during testing
    api.transactions.list({ status: 'PENDING' })
      .then(list => setPendingTxns(list || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleResolveCode = async (code) => {
    const raw = (code || manualCode).trim();
    if (!raw) return;

    let token = raw;
    if (raw.includes('/verify/')) {
      const parts = raw.split('/verify/');
      token = parts[1].split('?')[0].split('#')[0];
    } else if (raw.startsWith('trustkhata:tx:')) {
      token = raw.replace('trustkhata:tx:', '');
    }

    setClaiming(true);
    try {
      if (!isAuthenticated) {
        await quickLoginAs('customer1');
      }
      // Explicitly claim/link customer so vendor's screen shows the customer immediately!
      await api.transactions.claim(token);
    } catch (e) {
      // Continue to verify screen
    } finally {
      setClaiming(false);
      navigate(`/verify/${token}`);
    }
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
      setScanError('Unable to access camera in this browser. You can paste the code or use 1-click test bills below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="kb-card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
        }}>
          <QrCode size={28} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>
          Scan Shopkeeper QR Code
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Scan the QR displayed on the shopkeeper's counter or phone. Your details will automatically connect to review the credit entry.
        </p>

        {/* Camera Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          height: '240px',
          margin: '0 auto 20px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#090d16',
          border: '2px dashed rgba(56, 189, 248, 0.5)',
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
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>
              <Camera size={36} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Camera Stream Inactive</div>
              <button 
                onClick={startCamera} 
                className="btn-primary" 
                style={{ marginTop: '12px', padding: '7px 16px', fontSize: '0.82rem' }}
              >
                Enable Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <button
              onClick={stopCamera}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem'
              }}
            >
              Stop Camera
            </button>
          )}
        </div>

        {scanError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '0.82rem',
            marginBottom: '20px'
          }}>
            {scanError}
          </div>
        )}

        {/* Manual Code / Link Input */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', textAlign: 'left' }}>
            OR ENTER QR TOKEN / LINK MANUALLY:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Paste verification link or token..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              style={{ borderRadius: '10px', fontSize: '0.88rem' }}
            />
            <button 
              onClick={() => handleResolveCode()} 
              disabled={claiming || !manualCode.trim()} 
              className="btn-primary"
              style={{ padding: '0 18px', flexShrink: 0 }}
            >
              <ArrowRight size={16} />
              <span>{claiming ? 'Connecting...' : 'Scan'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Available Active Bills for Testing */}
        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Bills Awaiting Verification ({pendingTxns.length})
            </span>
            <button onClick={loadPending} style={{ color: 'var(--text-dim)', padding: '2px' }} title="Refresh">
              <RefreshCw size={13} />
            </button>
          </div>

          {pendingTxns.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>
              No pending bills currently waiting for scan. Generate one from the Vendor screen!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingTxns.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => handleResolveCode(tx.secure_token)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      <Store size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                        {tx.shop_name || 'Sharma Kirana Store'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {tx.description || 'Credit Goods'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                      ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      1-Click Scan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
