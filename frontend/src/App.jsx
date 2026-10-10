import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import VendorDashboard from './pages/VendorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateTransaction from './pages/CreateTransaction';
import VerifyTransaction from './pages/VerifyTransaction';
import QRScannerPage from './pages/QRScannerPage';
import SharedLedger from './pages/SharedLedger';

function HomeRedirect() {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return role === 'VENDOR' ? <Navigate to="/vendor" replace /> : <Navigate to="/customer" replace />;
}

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'VENDOR' ? '/vendor' : '/customer'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              
              {/* Vendor Routes */}
              <Route 
                path="/vendor" 
                element={
                  <ProtectedRoute allowedRole="VENDOR">
                    <VendorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/create" 
                element={
                  <ProtectedRoute allowedRole="VENDOR">
                    <CreateTransaction />
                  </ProtectedRoute>
                } 
              />

              {/* Customer Routes */}
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/scan" element={<QRScannerPage />} />

              {/* Shared Routes */}
              <Route path="/verify/:token" element={<VerifyTransaction />} />
              <Route path="/ledger" element={<SharedLedger />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
