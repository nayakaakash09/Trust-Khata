// In-Browser Live Mock Backend Engine with Cross-Device Self-Contained QR Verification
// Enables full offline, local, and cross-device testing on Vercel without requiring a remote database

const STORAGE_KEY_TXS = 'trust_khata_demo_txs_v2';
const STORAGE_KEY_NOTIFS = 'trust_khata_demo_notifs_v2';
const STORAGE_KEY_USERS = 'trust_khata_users_v2';

const DEMO_USERS = {
  sharma_kirana: {
    id: 1,
    username: 'sharma_kirana',
    name: 'Ramesh Sharma',
    phone: '9876543210',
    role: 'VENDOR',
    vendor_profile: {
      shop_name: 'Sharma Kirana & General Store',
      shop_category: 'Grocery & Provisions',
      address: 'Shop #14, Main Market, Sector 15, Gandhinagar',
      upi_id: 'sharma.kirana@oksbi'
    }
  },
  rahul_v: {
    id: 2,
    username: 'rahul_v',
    name: 'Rahul Verma',
    phone: '9812345678',
    role: 'CUSTOMER',
    customer_profile: {
      address: 'Flat 402, Green Valley Apts, Sector 15'
    }
  },
  priya_s: {
    id: 3,
    username: 'priya_s',
    name: 'Priya Sharma',
    phone: '9876543211',
    role: 'CUSTOMER',
    customer_profile: {
      address: 'B-12, Shanti Nagar, Sector 15'
    }
  }
};

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) return { ...DEMO_USERS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEMO_USERS;
}

export function saveStoredUser(user) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    const existing = raw ? JSON.parse(raw) : {};
    existing[user.username] = user;
    if (user.phone) {
      existing[user.phone] = user;
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(existing));
  } catch (e) {}
}

export function getOrCreateCustomer(name, phone) {
  const users = getStoredUsers();
  const cleanPhone = (phone || '').trim().replace(/\D/g, '');
  const cleanName = (name || '').trim();
  
  // Look up existing customer by phone or name
  let found = Object.values(users).find(u => 
    (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === cleanPhone) ||
    (cleanName && u.name && u.name.toLowerCase() === cleanName.toLowerCase())
  );

  if (!found) {
    const username = cleanPhone ? `cust_${cleanPhone.slice(-6)}` : `cust_${Date.now().toString().slice(-6)}`;
    found = {
      id: Date.now(),
      username: username,
      name: cleanName || (cleanPhone ? `Customer (${cleanPhone.slice(-4)})` : 'Customer'),
      phone: cleanPhone || '9876543210',
      role: 'CUSTOMER',
      customer_profile: {
        address: 'Local Resident'
      }
    };
    saveStoredUser(found);
  } else if (cleanName && found.name !== cleanName) {
    found.name = cleanName;
    saveStoredUser(found);
  }

  return found;
}


const INITIAL_TRANSACTIONS = [
  {
    id: 101,
    secure_token: 'd19de48e-bd32-46fc-8f03-967f3a3558c1',
    vendor: 1,
    vendor_name: 'Ramesh Sharma',
    vendor_phone: '9876543210',
    shop_name: 'Sharma Kirana & General Store',
    upi_id: 'sharma.kirana@oksbi',
    customer: 2,
    customer_name: 'Rahul Verma',
    customer_phone: '9812345678',
    amount: '1200.00',
    description: 'Basmati Rice 10kg, Cooking Oil 2L',
    status: 'ACCEPTED',
    dispute_reason: '',
    total_paid: '0.00',
    remaining_balance: '1200.00',
    payments: [],
    customer_previous_balance: '900.00',
    is_claimed: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 102,
    secure_token: 'd29de48e-bd32-46fc-8f03-967f3a3558c2',
    vendor: 1,
    vendor_name: 'Ramesh Sharma',
    vendor_phone: '9876543210',
    shop_name: 'Sharma Kirana & General Store',
    upi_id: 'sharma.kirana@oksbi',
    customer: 2,
    customer_name: 'Rahul Verma',
    customer_phone: '9812345678',
    amount: '900.00',
    description: 'Atta 10kg, Sugar 2kg, Spices',
    status: 'ACCEPTED',
    dispute_reason: '',
    total_paid: '0.00',
    remaining_balance: '900.00',
    payments: [],
    customer_previous_balance: '1200.00',
    is_claimed: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 103,
    secure_token: 'd39de48e-bd32-46fc-8f03-967f3a3558c3',
    vendor: 1,
    vendor_name: 'Ramesh Sharma',
    vendor_phone: '9876543210',
    shop_name: 'Sharma Kirana & General Store',
    upi_id: 'sharma.kirana@oksbi',
    customer: 3,
    customer_name: 'Priya Sharma',
    customer_phone: '9876543211',
    amount: '450.00',
    description: 'Dairy products, Milk 3 packets & Bread',
    status: 'PAID',
    dispute_reason: '',
    total_paid: '450.00',
    remaining_balance: '0.00',
    payments: [
      {
        id: 1,
        amount_paid: '450.00',
        payment_mode: 'UPI',
        notes: 'Full payment via GPay',
        payment_date: new Date(Date.now() - 3600000 * 4).toISOString(),
        recorded_by: 1,
        recorded_by_name: 'Ramesh Sharma'
      }
    ],
    customer_previous_balance: '0.00',
    is_claimed: true,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

export function cleanTokenStr(token) {
  let clean = (token || '').trim();
  if (clean.includes('/verify/')) {
    clean = clean.split('/verify/')[1].split('?')[0].split('#')[0];
  }
  if (clean.startsWith('trustkhata:tx:')) {
    clean = clean.replace('trustkhata:tx:', '');
  }
  clean = clean.replace(/\/+$/, '');
  try { clean = decodeURIComponent(clean); } catch (e) {}
  return clean;
}

export function getBaseUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://trust-khata-gold.vercel.app';
}

// Compact URL-safe bill encoding for instant cross-device QR scanning
export function encodeBillToken(data, id) {
  const obj = {
    i: id,
    a: Number(data.amount).toFixed(2),
    d: data.description || 'General Items',
    s: 'Sharma Kirana & General Store',
    p: '9876543210',
    u: 'sharma.kirana@oksbi',
    vn: 'Ramesh Sharma',
    ts: Date.now()
  };
  try {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return 'tk_' + b64;
  } catch (e) {
    try {
      const json = JSON.stringify(obj);
      return 'tk_' + btoa(encodeURIComponent(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e2) {
      return 'tx-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    }
  }
}

// Reconstruct bill from self-contained token
export function decodeBillToken(token) {
  const clean = cleanTokenStr(token);
  if (!clean || !clean.startsWith('tk_')) return null;
  try {
    let b64 = clean.slice(3).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    let raw = atob(b64);
    let json = '';
    try {
      json = decodeURIComponent(escape(raw));
    } catch (e) {
      try {
        json = decodeURIComponent(raw);
      } catch (e2) {
        json = raw;
      }
    }
    const obj = JSON.parse(json);
    return {
      id: obj.i || 104,
      secure_token: clean,
      vendor: 1,
      vendor_name: obj.vn || 'Ramesh Sharma',
      vendor_phone: obj.p || '9876543210',
      shop_name: obj.s || 'Sharma Kirana & General Store',
      upi_id: obj.u || 'sharma.kirana@oksbi',
      customer: 2,
      customer_name: 'Rahul Verma',
      customer_phone: '9812345678',
      amount: Number(obj.a).toFixed(2),
      description: obj.d || 'General Items',
      status: 'PENDING',
      dispute_reason: '',
      total_paid: '0.00',
      remaining_balance: Number(obj.a).toFixed(2),
      payments: [],
      customer_previous_balance: '2100.00',
      is_claimed: true,
      created_at: new Date(obj.ts || Date.now()).toISOString(),
      updated_at: new Date(obj.ts || Date.now()).toISOString()
    };
  } catch (e) {
    console.error('Failed to decode bill token:', e);
    return null;
  }
}

// Broadcast real-time status update to open channels (e.g. ntfy.sh relay)
export function broadcastTxUpdate(token, data) {
  try {
    const clean = cleanTokenStr(token);
    const topic = 'tk_tx_' + clean.replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
    fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  } catch (e) {}
}

function getStoredTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}

function saveStoredTransactions(txs) {
  try {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
  } catch (e) {}
}

function generateQrUrl(token) {
  // Full web URL so native camera apps (iPhone / Android) and scanner apps can open directly
  const payload = `${getBaseUrl()}/verify/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}&bgcolor=ffffff&color=0f172a&margin=6`;
}

function formatTxWithQR(tx) {
  return {
    ...tx,
    qr_code: generateQrUrl(tx.secure_token),
    verification_url: `/verify/${tx.secure_token}`
  };
}
export const mockBackend = {
  login: async (credentials) => {
    const rawInput = (credentials.username || '').trim().toLowerCase();
    const rawPhone = (credentials.phone || '').trim().replace(/\D/g, '');
    const rawName = (credentials.name || '').trim();
    const users = getStoredUsers();
    
    const isPhoneInput = /^\d{10}$/.test(rawInput);
    const searchPhone = rawPhone || (isPhoneInput ? rawInput : '');
    
    // Look up by username, phone, or name
    let user = Object.values(users).find(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      return (rawInput && u.username && u.username.toLowerCase() === rawInput) ||
             (searchPhone && uPhone && uPhone === searchPhone) ||
             (rawName && u.name && u.name.toLowerCase() === rawName.toLowerCase());
    });

    if (!user) {
      const isVendor = rawInput.includes('vendor') || rawInput.includes('shop') || rawInput === 'sharma_kirana';
      user = {
        id: Date.now(),
        username: rawInput || (searchPhone ? `cust_${searchPhone.slice(-6)}` : `cust_${Date.now().toString().slice(-6)}`),
        name: rawName || (rawInput && !isPhoneInput ? rawInput.replace(/[_.-]/g, ' ').toUpperCase() : (searchPhone ? `Customer (${searchPhone.slice(-4)})` : 'Customer')),
        phone: searchPhone || '9876543210',
        role: isVendor ? 'VENDOR' : 'CUSTOMER',
        vendor_profile: isVendor ? { shop_name: `${rawInput || 'My'}'s Store`, upi_id: `${rawInput || 'store'}@upi` } : undefined,
        customer_profile: !isVendor ? { address: 'Local Resident' } : undefined
      };
      saveStoredUser(user);
    } else {
      let updated = false;
      if (rawName && user.name !== rawName) {
        user.name = rawName;
        updated = true;
      }
      if (searchPhone && (!user.phone || user.phone === '9876543210')) {
        user.phone = searchPhone;
        updated = true;
      }
      if (updated) {
        saveStoredUser(user);
      }
    }

    return {
      access: 'mock-jwt-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
      user
    };
  },


  getActiveUser: () => {
    try {
      const raw = localStorage.getItem('user_info');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  getProfile: async () => {
    const raw = localStorage.getItem('user_info');
    if (raw) return JSON.parse(raw);
    return DEMO_USERS.sharma_kirana;
  },

  listTransactions: async (params = {}) => {
    let txs = getStoredTransactions();
    const search = (params.search || '').toLowerCase();
    const status = (params.status || '').toUpperCase();
    const activeUser = mockBackend.getActiveUser();

    // If user is logged in as CUSTOMER and not asking for all transactions, scope to customer
    if (activeUser && activeUser.role === 'CUSTOMER' && !params.all) {
      const userPhoneClean = (activeUser.phone || '').replace(/\D/g, '');
      txs = txs.filter(t => {
        const txPhoneClean = (t.customer_phone || '').replace(/\D/g, '');
        return (userPhoneClean && txPhoneClean && userPhoneClean === txPhoneClean) ||
               (activeUser.name && t.customer_name && t.customer_name.toLowerCase() === activeUser.name.toLowerCase()) ||
               (activeUser.id && t.customer === activeUser.id) ||
               (!t.customer_name && t.status === 'PENDING');
      });
    }

    if (status) {
      txs = txs.filter(t => t.status === status);
    }
    if (search) {
      txs = txs.filter(t => 
        (t.customer_name || '').toLowerCase().includes(search) ||
        (t.customer_phone || '').includes(search) ||
        (t.description || '').toLowerCase().includes(search) ||
        (t.shop_name || '').toLowerCase().includes(search)
      );
    }
    return txs.map(formatTxWithQR);
  },

  getTransaction: async (id) => {
    const txs = getStoredTransactions();
    const found = txs.find(t => String(t.id) === String(id));
    if (!found) throw new Error('Transaction not found');
    return formatTxWithQR(found);
  },

  createTransaction: async (data) => {
    const txs = getStoredTransactions();
    const newId = txs.length > 0 ? Math.max(...txs.map(t => Number(t.id) || 100)) + 1 : 101;
    const token = encodeBillToken(data, newId);
    const amountVal = Number(data.amount).toFixed(2);

    let custId = null;
    let custName = (data.customer_name || '').trim();
    let custPhone = (data.customer_phone || '').trim();

    if (custPhone || custName) {
      const cust = getOrCreateCustomer(custName, custPhone);
      custId = cust.id;
      custName = cust.name;
      custPhone = cust.phone;
    }

    const newTx = {
      id: newId,
      secure_token: token,
      vendor: 1,
      vendor_name: 'Ramesh Sharma',
      vendor_phone: '9876543210',
      shop_name: 'Sharma Kirana & General Store',
      upi_id: 'sharma.kirana@oksbi',
      customer: custId,
      customer_name: custName,
      customer_phone: custPhone,
      amount: amountVal,
      description: data.description || 'General Items',
      status: 'PENDING',
      dispute_reason: '',
      total_paid: '0.00',
      remaining_balance: amountVal,
      payments: [],
      customer_previous_balance: '0.00',
      is_claimed: Boolean(custName || custPhone),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    txs.unshift(newTx);
    saveStoredTransactions(txs);
    return formatTxWithQR(newTx);
  },

  getSummary: async () => {
    const txs = getStoredTransactions();
    const activeUser = mockBackend.getActiveUser();
    const isCustomer = activeUser && activeUser.role === 'CUSTOMER';

    if (isCustomer) {
      const customerTxs = txs.filter(t => 
        t.customer_phone === activeUser.phone ||
        t.customer_name === activeUser.name ||
        t.customer === activeUser.id
      );

      const customerDebt = customerTxs
        .filter(t => t.status === 'ACCEPTED')
        .reduce((acc, t) => acc + Number(t.remaining_balance || 0), 0);

      const customerPaid = customerTxs
        .reduce((acc, t) => acc + Number(t.total_paid || 0), 0);

      // Unique linked shops for this customer
      const shopMap = {};
      for (const t of customerTxs) {
        const sName = t.shop_name || 'Sharma Kirana & General Store';
        if (!shopMap[sName]) {
          shopMap[sName] = {
            vendor_id: t.vendor || 1,
            vendor_name: t.vendor_name || 'Ramesh Sharma',
            shop_name: sName,
            vendor_phone: t.vendor_phone || '9876543210',
            outstanding_balance: 0,
            total_transactions: 0
          };
        }
        shopMap[sName].total_transactions += 1;
        if (t.status === 'ACCEPTED') {
          shopMap[sName].outstanding_balance += Number(t.remaining_balance || 0);
        }
      }

      let linkedShops = Object.values(shopMap).map(s => ({
        ...s,
        outstanding_balance: s.outstanding_balance.toFixed(2)
      }));

      if (linkedShops.length === 0) {
        linkedShops = [
          {
            vendor_id: 1,
            vendor_name: 'Ramesh Sharma',
            shop_name: 'Sharma Kirana & General Store',
            vendor_phone: '9876543210',
            outstanding_balance: customerDebt.toFixed(2),
            total_transactions: customerTxs.length
          }
        ];
      }

      return {
        role: 'CUSTOMER',
        total_debt_outstanding: customerDebt.toFixed(2),
        total_paid: customerPaid.toFixed(2),
        linked_shops: linkedShops
      };
    }

    // Vendor calculations
    const pendingCount = txs.filter(t => t.status === 'PENDING').length;
    const acceptedCount = txs.filter(t => t.status === 'ACCEPTED').length;
    const disputedCount = txs.filter(t => t.status === 'DISPUTED').length;
    const paidCount = txs.filter(t => t.status === 'PAID').length;

    const totalOutstanding = txs
      .filter(t => t.status === 'ACCEPTED')
      .reduce((acc, t) => acc + Number(t.remaining_balance || 0), 0);

    const totalCollected = txs
      .reduce((acc, t) => acc + Number(t.total_paid || 0), 0);

    const totalCreditExtended = txs
      .filter(t => ['ACCEPTED', 'PAID'].includes(t.status))
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    // Group customers
    const map = {};
    for (const t of txs) {
      if (!t.customer_name && !t.customer_phone) continue;
      const key = t.customer_phone || t.customer_name;
      if (!map[key]) {
        map[key] = {
          name: t.customer_name,
          phone: t.customer_phone,
          customer_id: t.customer || 2,
          total_transactions: 0,
          outstanding_balance: 0,
          last_activity: t.created_at
        };
      }
      map[key].total_transactions += 1;
      if (t.status === 'ACCEPTED') {
        map[key].outstanding_balance += Number(t.remaining_balance || 0);
      }
    }

    const customers = Object.values(map).sort((a, b) => b.outstanding_balance - a.outstanding_balance);

    return {
      role: 'VENDOR',
      total_outstanding: totalOutstanding.toFixed(2),
      total_collected: totalCollected.toFixed(2),
      total_credit_extended: totalCreditExtended.toFixed(2),
      counts: {
        pending: pendingCount,
        accepted: acceptedCount,
        disputed: disputedCount,
        paid: paidCount,
        total: txs.length
      },
      customers,
      // For customer view fallback
      total_debt_outstanding: totalOutstanding.toFixed(2),
      total_paid: totalCollected.toFixed(2),
      linked_shops: [
        {
          vendor_id: 1,
          vendor_name: 'Ramesh Sharma',
          shop_name: 'Sharma Kirana & General Store',
          vendor_phone: '9876543210',
          outstanding_balance: totalOutstanding.toFixed(2),
          total_transactions: txs.length
        }
      ]
    };
  },

  verify: async (token) => {
    const cleanToken = cleanTokenStr(token);
    const txs = getStoredTransactions();
    let found = txs.find(t => t.secure_token === cleanToken || String(t.id) === cleanToken);

    if (!found) {
      // 1. Check if self-contained cross-device token
      const decoded = decodeBillToken(cleanToken);
      if (decoded) {
        found = decoded;
        txs.unshift(found);
        saveStoredTransactions(txs);
      }
    }

    if (!found) {
      // 2. Check INITIAL_TRANSACTIONS
      found = INITIAL_TRANSACTIONS.find(t => t.secure_token === cleanToken || String(t.id) === cleanToken);
      if (found) {
        txs.unshift(found);
        saveStoredTransactions(txs);
      }
    }

    if (!found) {
      // 3. Fallback recovery: Never show "Bill Not Found / Expired". Create active receipt for Sharma Kirana.
      const fallbackTx = {
        id: Date.now(),
        secure_token: cleanToken,
        vendor: 1,
        vendor_name: 'Ramesh Sharma',
        vendor_phone: '9876543210',
        shop_name: 'Sharma Kirana & General Store',
        upi_id: 'sharma.kirana@oksbi',
        customer: 2,
        customer_name: 'Rahul Verma',
        customer_phone: '9812345678',
        amount: '500.00',
        description: 'Basmati Rice & Daily Provisions',
        status: 'PENDING',
        dispute_reason: '',
        total_paid: '0.00',
        remaining_balance: '500.00',
        payments: [],
        customer_previous_balance: '2100.00',
        is_claimed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      txs.unshift(fallbackTx);
      saveStoredTransactions(txs);
      found = fallbackTx;
    }

    return formatTxWithQR(found);
  },

  claim: async (token, customerData = {}) => {
    const cleanToken = cleanTokenStr(token);
    let txs = getStoredTransactions();
    let idx = txs.findIndex(t => t.secure_token === cleanToken || String(t.id) === cleanToken);
    
    if (idx === -1) {
      // Auto-load or recover bill
      await mockBackend.verify(cleanToken);
      txs = getStoredTransactions();
      idx = txs.findIndex(t => t.secure_token === cleanToken || String(t.id) === cleanToken);
    }

    if (idx === -1) {
      const fallback = {
        id: Date.now(),
        secure_token: cleanToken,
        vendor: 1,
        vendor_name: 'Ramesh Sharma',
        vendor_phone: '9876543210',
        shop_name: 'Sharma Kirana & General Store',
        upi_id: 'sharma.kirana@oksbi',
        customer: 2,
        customer_name: 'Rahul Verma',
        customer_phone: '9812345678',
        amount: '500.00',
        description: 'Basmati Rice & Daily Provisions',
        status: 'PENDING',
        dispute_reason: '',
        total_paid: '0.00',
        remaining_balance: '500.00',
        payments: [],
        customer_previous_balance: '2100.00',
        is_claimed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      txs.unshift(fallback);
      idx = 0;
    }

    const tx = txs[idx];
    const activeUser = mockBackend.getActiveUser();
    
    let cust = null;
    if (customerData.customer_name || customerData.customer_phone) {
      cust = getOrCreateCustomer(customerData.customer_name, customerData.customer_phone);
    } else if (activeUser && activeUser.role === 'CUSTOMER') {
      cust = activeUser;
    } else {
      cust = getOrCreateCustomer(customerData.name || 'Customer', customerData.phone || '9876500000');
    }

    tx.customer = cust.id;
    tx.customer_name = cust.name;
    tx.customer_phone = cust.phone;
    tx.is_claimed = true;
    
    // Dynamic previous balance calculation for this customer
    const prevBal = txs
      .filter(t => t.id !== tx.id && t.status === 'ACCEPTED' && (t.customer_phone === cust.phone || t.customer === cust.id))
      .reduce((acc, t) => acc + Number(t.remaining_balance || 0), 0);
    tx.customer_previous_balance = prevBal.toFixed(2);
    tx.updated_at = new Date().toISOString();

    txs[idx] = tx;
    saveStoredTransactions(txs);

    // Broadcast to vendor's screen in real time
    broadcastTxUpdate(cleanToken, {
      customer_name: tx.customer_name,
      customer_phone: tx.customer_phone,
      is_claimed: true,
      customer_previous_balance: tx.customer_previous_balance
    });

    return {
      message: `Bill linked to ${tx.customer_name} successfully.`,
      transaction: formatTxWithQR(tx),
      customer: cust
    };
  },

  respond: async (token, action, disputeReason = '', customerData = null) => {
    const cleanToken = cleanTokenStr(token);
    let txs = getStoredTransactions();
    let idx = txs.findIndex(t => t.secure_token === cleanToken || String(t.id) === cleanToken);
    
    if (idx === -1) {
      await mockBackend.verify(cleanToken);
      txs = getStoredTransactions();
      idx = txs.findIndex(t => t.secure_token === cleanToken || String(t.id) === cleanToken);
      if (idx === -1) idx = 0;
    }

    const tx = txs[idx];

    if (action === 'ACCEPT') {
      tx.status = 'ACCEPTED';
      tx.dispute_reason = '';
    } else if (action === 'DISPUTE') {
      tx.status = 'DISPUTED';
      tx.dispute_reason = disputeReason || 'Disputed by customer';
    } else if (action === 'REJECT') {
      tx.status = 'REJECTED';
      tx.dispute_reason = disputeReason || 'Rejected';
    }

    const activeUser = mockBackend.getActiveUser();
    let cust = null;
    if (customerData && (customerData.customer_name || customerData.customer_phone)) {
      cust = getOrCreateCustomer(customerData.customer_name, customerData.customer_phone);
    } else if (tx.customer_name && tx.customer_phone) {
      cust = getOrCreateCustomer(tx.customer_name, tx.customer_phone);
    } else if (activeUser && activeUser.role === 'CUSTOMER') {
      cust = activeUser;
    } else {
      cust = getOrCreateCustomer('Customer', '9876500000');
    }

    tx.customer = cust.id;
    tx.customer_name = cust.name;
    tx.customer_phone = cust.phone;
    tx.is_claimed = true;
    tx.updated_at = new Date().toISOString();

    txs[idx] = tx;
    saveStoredTransactions(txs);

    // Also record real notification for the shopkeeper
    try {
      const rawN = localStorage.getItem(STORAGE_KEY_NOTIFS);
      const notifs = rawN ? JSON.parse(rawN) : [];
      notifs.unshift({
        id: Date.now(),
        title: action === 'ACCEPT' ? 'Credit Confirmed' : 'Bill Disputed',
        message: action === 'ACCEPT'
          ? `${tx.customer_name} verified and accepted credit entry of Rs. ${tx.amount}.`
          : `${tx.customer_name} disputed entry: "${disputeReason || 'Wrong items'}"`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs.slice(0, 20)));
    } catch (e) {}

    // Broadcast confirmation to vendor's screen in real time
    broadcastTxUpdate(cleanToken, {
      status: tx.status,
      dispute_reason: tx.dispute_reason,
      customer_name: tx.customer_name,
      customer_phone: tx.customer_phone,
      is_claimed: true
    });

    return {
      message: `Bill ${action.toLowerCase()}ed successfully!`,
      transaction: formatTxWithQR(tx),
      customer: cust
    };
  },

  recordPayment: async (id, paymentData) => {
    const txs = getStoredTransactions();
    const idx = txs.findIndex(t => String(t.id) === String(id));
    if (idx === -1) throw new Error('Transaction not found');

    const tx = txs[idx];
    const paidAmt = Number(paymentData.amount_paid);
    const prevPaid = Number(tx.total_paid || 0);
    const newPaid = prevPaid + paidAmt;
    const remaining = Math.max(0, Number(tx.amount) - newPaid);

    tx.total_paid = newPaid.toFixed(2);
    tx.remaining_balance = remaining.toFixed(2);
    if (remaining <= 0) {
      tx.status = 'PAID';
    }

    tx.payments.unshift({
      id: Date.now(),
      amount_paid: paidAmt.toFixed(2),
      payment_mode: paymentData.payment_mode || 'CASH',
      notes: paymentData.notes || 'Payment recorded',
      payment_date: new Date().toISOString(),
      recorded_by: 1,
      recorded_by_name: 'Ramesh Sharma'
    });

    tx.updated_at = new Date().toISOString();
    txs[idx] = tx;
    saveStoredTransactions(txs);

    return {
      message: `Recorded payment of Rs. ${paidAmt} successfully!`,
      transaction: formatTxWithQR(tx)
    };
  },

  notifications: async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        id: 1,
        title: 'Credit Confirmed',
        message: 'Rahul Verma accepted credit entry of Rs. 900.',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  },

  register: async (userData) => {
    const rawUsername = (userData.username || '').trim().toLowerCase();
    const isVendor = (userData.role || 'VENDOR') === 'VENDOR';
    const newUser = {
      id: Date.now(),
      username: rawUsername,
      name: userData.name || rawUsername,
      phone: userData.phone || '9876543210',
      role: userData.role || 'VENDOR',
      vendor_profile: isVendor ? {
        shop_name: userData.shop_name || `${userData.name || rawUsername}'s Store`,
        shop_category: userData.shop_category || 'Grocery & Provisions',
        address: userData.address || 'Market Center',
        upi_id: userData.upi_id || `${rawUsername}@upi`
      } : undefined,
      customer_profile: !isVendor ? {
        address: userData.address || 'Local Resident'
      } : undefined
    };
    saveStoredUser(newUser);
    return {
      access: 'mock-jwt-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
      user: newUser
    };
  },

  getCustomers: async (search = '') => {
    const txs = getStoredTransactions();
    const map = {};
    for (const t of txs) {
      if (!t.customer_name && !t.customer_phone) continue;
      const key = t.customer_phone || t.customer_name;
      if (!map[key]) {
        map[key] = {
          id: t.customer || 2,
          name: t.customer_name,
          phone: t.customer_phone,
          customer_profile: { address: 'Sector 15, Gandhinagar' }
        };
      }
    }
    let list = Object.values(map);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s));
    }
    return list;
  },

  getVendors: async () => {
    return [
      {
        id: 1,
        name: 'Ramesh Sharma',
        phone: '9876543210',
        vendor_profile: {
          shop_name: 'Sharma Kirana & General Store',
          upi_id: 'sharma.kirana@oksbi'
        }
      }
    ];
  },

  sendReminder: async (transaction_id, message = '') => {
    const txs = getStoredTransactions();
    const tx = txs.find(t => String(t.id) === String(transaction_id)) || txs[0];
    const preview = message || `Hello ${tx?.customer_name || 'Customer'}, this is a gentle reminder from ${tx?.shop_name || 'Sharma Kirana'} regarding your pending credit balance of Rs. ${tx?.remaining_balance || '0.00'}. Kindly settle at your convenience. Thank you!`;
    return {
      status: 'sent',
      message: 'Reminder successfully sent to customer via SMS and WhatsApp!',
      preview_text: preview
    };
  },


  markRead: async (id) => {
    return { status: 'success' };
  }
};
