import { mockBackend } from './mockBackend';

const IS_LOCAL = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

const CUSTOM_API_URL = import.meta.env.VITE_API_URL;
// If a backend URL is explicitly configured, or running on local dev machine, use it.
// When deployed on Vercel without a custom backend server, default to client-side mock backend.
const API_BASE = CUSTOM_API_URL || (IS_LOCAL ? 'http://127.0.0.1:8000/api' : null);

export const getAuthToken = () => localStorage.getItem('access_token');
export const setAuthToken = (token) => localStorage.setItem('access_token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
};

export async function apiRequest(endpoint, options = {}) {
  if (!API_BASE) {
    throw new Error('NO_REMOTE_BACKEND');
  }

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && (data.error || data.detail || (typeof data === 'object' && Object.values(data)[0]))) || `Request failed with status ${response.status}`;
    const err = new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Fallback executor: tries real API if configured, falls back to in-memory/localStorage mock backend
async function withFallback(apiCall, mockCall) {
  if (!API_BASE) {
    return await mockCall();
  }
  try {
    return await apiCall();
  } catch (err) {
    // If backend is unavailable, not found, or returning network/server errors
    if (
      err.message === 'NO_REMOTE_BACKEND' || 
      err.status === 404 || 
      err.status >= 500 || 
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError')
    ) {
      console.warn('Backend unavailable, using client-side offline storage:', err.message);
      return await mockCall();
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials) => withFallback(
      () => apiRequest('/accounts/login/', { method: 'POST', body: JSON.stringify(credentials) }),
      () => mockBackend.login(credentials)
    ),
    register: (userData) => withFallback(
      () => apiRequest('/accounts/register/', { method: 'POST', body: JSON.stringify(userData) }),
      () => mockBackend.register(userData)
    ),
    getProfile: () => withFallback(
      () => apiRequest('/accounts/me/'),
      () => mockBackend.getProfile()
    ),
    getCustomers: (search = '') => withFallback(
      () => apiRequest(`/accounts/customers/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
      () => mockBackend.getCustomers(search)
    ),
    getVendors: () => withFallback(
      () => apiRequest('/accounts/vendors/'),
      () => mockBackend.getVendors()
    ),
  },
  transactions: {
    list: (params = {}) => withFallback(
      () => {
        const q = new URLSearchParams(params).toString();
        return apiRequest(`/transactions/${q ? `?${q}` : ''}`);
      },
      () => mockBackend.listTransactions(params)
    ),
    get: (id) => withFallback(
      () => apiRequest(`/transactions/${id}/`),
      () => mockBackend.getTransaction(id)
    ),
    create: (txData) => withFallback(
      () => apiRequest('/transactions/', { method: 'POST', body: JSON.stringify(txData) }),
      () => mockBackend.createTransaction(txData)
    ),
    getSummary: () => withFallback(
      () => apiRequest('/transactions/summary/'),
      () => mockBackend.getSummary()
    ),
    verify: (token) => withFallback(
      () => apiRequest(`/transactions/verify/${token}/`),
      () => mockBackend.verify(token)
    ),
    claim: (token, customerData = {}) => withFallback(
      () => apiRequest(`/transactions/verify/${token}/claim/`, { 
        method: 'POST', 
        body: JSON.stringify(customerData) 
      }),
      () => mockBackend.claim(token, customerData)
    ),
    respond: (token, action, dispute_reason = '') => withFallback(
      () => apiRequest(`/transactions/verify/${token}/respond/`, { 
        method: 'POST', 
        body: JSON.stringify({ action, dispute_reason }) 
      }),
      () => mockBackend.respond(token, action, dispute_reason)
    ),
    recordPayment: (id, paymentData) => withFallback(
      () => apiRequest(`/transactions/${id}/payments/`, { 
        method: 'POST', 
        body: JSON.stringify(paymentData) 
      }),
      () => mockBackend.recordPayment(id, paymentData)
    ),
  },
  notifications: {
    list: () => withFallback(
      () => apiRequest('/notifications/'),
      () => mockBackend.notifications()
    ),
    markRead: (id) => withFallback(
      () => apiRequest(`/notifications/${id}/read/`, { method: 'PATCH' }),
      () => mockBackend.markRead(id)
    ),
    sendReminder: (transaction_id, message = '') => withFallback(
      () => apiRequest('/notifications/remind/', { 
        method: 'POST', 
        body: JSON.stringify({ transaction_id, message }) 
      }),
      () => mockBackend.sendReminder(transaction_id, message)
    ),
  }
};
