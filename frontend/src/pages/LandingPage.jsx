import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Store, 
  User, 
  QrCode, 
  Layers, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  TrendingUp, 
  MessageCircle,
  FileCheck,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleLaunchVendor = async () => {
    await quickLoginAs('vendor');
    navigate('/vendor');
  };

  const handleLaunchCustomer = async () => {
    await quickLoginAs('customer1');
    navigate('/customer');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', paddingBottom: '60px' }}>
      {/* HERO SECTION */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '50px 20px 30px',
        textAlign: 'center'
      }}>
        {/* Top Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '22px'
        }}>
          <Sparkles size={15} />
          <span>Next-Generation Digital Credit Ledger & QR Verification</span>
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 900,
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          marginBottom: '18px',
          color: '#ffffff'
        }}>
          Replace Paper Notebooks with <br />
          <span className="gradient-text-emerald">Mutual QR Trust</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-muted)',
          maxWidth: '740px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          A transparent digital Khata for local shopkeepers and customers. 
          Generate bills with zero customer data entry, verify instantly via QR code, 
          and eliminate ledger disputes forever.
        </p>

        {/* Big Interactive 1-Click Launch Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '920px',
          margin: '0 auto 48px'
        }}>
          {/* Card 1: Shopkeeper Portal */}
          <div 
            className="kb-card"
            style={{
              padding: '32px 28px',
              textAlign: 'left',
              border: '2px solid rgba(16, 185, 129, 0.35)',
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
            }}>
              <Store size={26} />
            </div>

            <span className="kb-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', marginBottom: '8px' }}>
              MERCHANT / VENDOR PORTAL
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Sharma Kirana Store
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Track outstanding dues (<strong>YOU WILL GET: ₹2,100</strong>), generate quick credit QR bills with zero customer data entry, and record UPI or cash settlements.
            </p>

            <button
              onClick={handleLaunchVendor}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>1-Click Test as Shopkeeper</span>
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Card 2: Customer Passbook */}
          <div 
            className="kb-card"
            style={{
              padding: '32px 28px',
              textAlign: 'left',
              border: '2px solid rgba(99, 102, 241, 0.35)',
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
            }}>
              <User size={26} />
            </div>

            <span className="kb-pill" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid #6366f1', marginBottom: '8px' }}>
              CUSTOMER PASSBOOK
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Rahul Verma
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Inspect your verified credit passbook (<strong>YOU WILL PAY: ₹2,100</strong>), scan merchant QR bills with real-time camera decoding, and approve or dispute entries.
            </p>

            <button
              onClick={handleLaunchCustomer}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>1-Click Test as Customer</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* Quick Utility Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '50px'
        }}>
          <Link 
            to="/scan"
            className="btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.92rem', gap: '8px' }}
          >
            <QrCode size={18} color="#34d399" />
            <span>Open In-App Camera Scanner</span>
          </Link>

          <Link 
            to="/ledger"
            className="btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.92rem', gap: '8px' }}
          >
            <Layers size={18} color="#38bdf8" />
            <span>Explore Synchronized Public Ledger</span>
          </Link>

          <Link 
            to="/login"
            className="btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.92rem', gap: '8px' }}
          >
            <Lock size={16} />
            <span>Sign In / Register Custom Shop</span>
          </Link>
        </div>
      </section>

      {/* CORE INNOVATION HIGHLIGHTS */}
      <section style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Built for Real-World Indian Retail
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Solves the friction of traditional pen-and-paper diaries and one-sided accounting apps
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {/* Feature 1 */}
          <div className="kb-card" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Zap size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
              Anonymous Quick QR Bills
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Merchants don't need to ask for customer phone numbers during rush hours. Just punch in amount + items to show a QR.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="kb-card" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Smartphone size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
              Instant Cross-Device Sync
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Scan from any mobile phone or native camera app. The customer claim and approval reflects on the shopkeeper counter in milliseconds.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="kb-card" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
              Mutual Verification
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Credit entries only become active when approved by the customer, eliminating month-end discrepancies and lost notebook disputes.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="kb-card" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <MessageCircle size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
              1-Click WhatsApp Reminders
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Send polite, transparent payment reminders via WhatsApp with pre-formatted bill details, items breakdown, and shop UPI ID.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
