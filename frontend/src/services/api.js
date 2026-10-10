const API_BASE = 'http://127.0.0.1:8000/api';

export const getAuthToken = () => localStorage.getItem('access_token');
export const setAuthToken = (token) => localStorage.setItem('access_token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
};

export async function apiRequest(endpoint, options = {}) {
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

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
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

export const api = {
  auth: {
    login: (credentials) => apiRequest('/accounts/login/', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => apiRequest('/accounts/register/', { method: 'POST', body: JSON.stringify(userData) }),
    getProfile: () => apiRequest('/accounts/me/'),
    getCustomers: (search = '') => apiRequest(`/accounts/customers/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getVendors: () => apiRequest('/accounts/vendors/'),
  },
  transactions: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return apiRequest(`/transactions/${q ? `?${q}` : ''}`);
    },
    get: (id) => apiRequest(`/transactions/${id}/`),
    create: (txData) => apiRequest('/transactions/', { method: 'POST', body: JSON.stringify(txData) }),
    getSummary: () => apiRequest('/transactions/summary/'),
    verify: (token) => apiRequest(`/transactions/verify/${token}/`),
    respond: (token, action, dispute_reason = '') => 
      apiRequest(`/transactions/verify/${token}/respond/`, { 
        method: 'POST', 
        body: JSON.stringify({ action, dispute_reason }) 
      }),
    recordPayment: (id, paymentData) => 
      apiRequest(`/transactions/${id}/payments/`, { 
        method: 'POST', 
        body: JSON.stringify(paymentData) 
      }),
  },
  notifications: {
    list: () => apiRequest('/notifications/'),
    markRead: (id) => apiRequest(`/notifications/${id}/read/`, { method: 'PATCH' }),
    sendReminder: (transaction_id, message = '') => 
      apiRequest('/notifications/remind/', { 
        method: 'POST', 
        body: JSON.stringify({ transaction_id, message }) 
      }),
  }
};
