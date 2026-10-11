import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  Camera, 
  CameraOff,
  Upload,
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Store,
  SwitchCamera
} from 'lucide-react';

import { cleanTokenStr } from '../services/mockBackend';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, quickLoginAs } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [pendingTxns, setPendingTxns] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [detectedCode, setDetectedCode] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadPending = () => {
    // Load pending transactions to enable 1-click verification during testing
    api.transactions.list({ status: 'PENDING' })
      .then(list => setPendingTxns(list || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadPending();
    return () => {
      stopCamera();
    };
  }, []);

  const handleResolveCode = async (code) => {
    const raw = (code || manualCode).trim();
    if (!raw) return;

    let token = cleanTokenStr(raw);
    if (!token) token = raw;


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

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (targetFacing = facingMode) => {
    setScanError('');
    setDetectedCode(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError('Camera is not supported on this browser or connection. Note: Browsers require HTTPS or localhost to enable camera access. You can upload a photo of the QR code instead!');
      return;
    }

    try {
      let stream;
      try {
        // Try requested facing mode (ideal for mobile back camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (modeErr) {
        // Fallback to generic video constraints (for laptops and desktop webcams)
        console.warn('Ideal facingMode constraint failed, using generic camera stream:', modeErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        
        // Wait for video stream to start playing
        await videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScanError('Camera access was blocked by your browser. Please tap the camera/lock icon in your browser address bar and choose "Allow", then try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setScanError('No camera found on this computer. You can upload a QR image from your files or use the 1-click test buttons below.');
      } else if (err.name === 'NotReadableError') {
        setScanError('Camera is currently in use by another application. Please close other video apps and retry.');
      } else {
        setScanError(`Camera error: ${err.message || 'Unable to open camera.'}. You can upload a QR photo or paste the verification link.`);
      }
      setCameraActive(false);
    }
  };

  const startScanningLoop = () => {
    const scan = () => {
      if (!videoRef.current) return;

      if (videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            // QR Code Successfully Detected!
            setDetectedCode(code.data);
            stopCamera();
            handleResolveCode(code.data);
            return;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(scan);
    };

    animFrameRef.current = requestAnimationFrame(scan);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data) {
          setDetectedCode(code.data);
          handleResolveCode(code.data);
        } else {
          setScanError('Could not detect a QR code in this photo. Please make sure the QR is clear and well-lit, or paste the link manually.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick again if needed
    e.target.value = '';
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
          Point your camera at the vendor's screen or upload a photo to connect your account and verify the credit entry.
        </p>

        {/* Camera Viewport Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: '260px',
          margin: '0 auto 16px',
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#090d16',
          border: cameraActive ? '2px solid #10b981' : '2px dashed rgba(56, 189, 248, 0.4)',
          boxShadow: cameraActive ? '0 0 30px rgba(16, 185, 129, 0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Always-mounted Video element */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Scanner Overlay when active */}
          {cameraActive && (
            <>
              {/* Animated Laser Beam */}
              <div className="qr-scan-laser-beam" />

              {/* Viewfinder Target Frame Corners */}
              <div style={{
                position: 'absolute',
                top: '25px',
                bottom: '25px',
                left: '25px',
                right: '25px',
                border: '2px solid rgba(52, 211, 153, 0.6)',
                borderRadius: '14px',
                pointerEvents: 'none'
              }} />

              {/* Top Controls */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 20
              }}>
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title="Switch Camera"
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <SwitchCamera size={14} />
                  <span>Flip</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  title="Stop Camera"
                  style={{
                    background: 'rgba(239, 68, 68, 0.85)',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <CameraOff size={14} />
                  <span>Stop</span>
                </button>
              </div>

              {/* Live Status indicator */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#34d399',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 20
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Scanning for QR code...
              </div>
            </>
          )}

          {/* Idle Camera State */}
          {!cameraActive && (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Camera size={28} />
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                Camera Ready to Scan
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px', maxWidth: '240px' }}>
                Tap below to activate camera or pick a QR screenshot
              </div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => startCamera()} 
                  className="btn-primary" 
                  style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                >
                  <Camera size={15} />
                  <span>Start Camera</span>
                </button>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="btn-secondary" 
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  <Upload size={15} />
                  <span>Upload QR</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Gallery / Screenshot QR */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />

        {detectedCode && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#34d399',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>QR Code detected! Connecting transaction...</span>
          </div>
        )}

        {scanError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#f87171',
            fontSize: '0.82rem',
            textAlign: 'left',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>Camera Notice</div>
              <div>{scanError}</div>
            </div>
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
              type="button"
              onClick={() => handleResolveCode()} 
              disabled={claiming || !manualCode.trim()} 
              className="btn-primary"
              style={{ padding: '0 18px', flexShrink: 0 }}
            >
              <ArrowRight size={16} />
              <span>{claiming ? 'Connecting...' : 'Verify'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Available Active Bills for Testing */}
        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Bills Awaiting Verification ({pendingTxns.length})
            </span>
            <button type="button" onClick={loadPending} style={{ color: 'var(--text-dim)', padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }} title="Refresh">
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
