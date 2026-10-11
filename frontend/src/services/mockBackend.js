// In-Browser Live Mock Backend Engine
// Used when backend API is unreachable or deployed standalone on Vercel

const STORAGE_KEY_TXS = 'trust_khata_demo_txs_v2';
const STORAGE_KEY_NOTIFS = 'trust_khata_demo_notifs_v2';

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
  const payload = `trustkhata:tx:${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}&bgcolor=ffffff&color=0f172a&margin=6`;
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
    const username = credentials.username || 'sharma_kirana';
    const user = DEMO_USERS[username] || {
      id: 99,
      username,
      name: username.replace('_', ' ').toUpperCase(),
      role: 'VENDOR',
      vendor_profile: { shop_name: `${username}'s Store`, upi_id: `${username}@upi` }
    };
    return {
      access: 'mock-jwt-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
      user
    };
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

    if (status) {
      txs = txs.filter(t => t.status === status);
    }
    if (search) {
      txs = txs.filter(t => 
        (t.customer_name || '').toLowerCase().includes(search) ||
        (t.customer_phone || '').includes(search) ||
        (t.description || '').toLowerCase().includes(search)
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
    const token = 'tx-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    const newId = txs.length > 0 ? Math.max(...txs.map(t => Number(t.id))) + 1 : 101;
    const amountVal = Number(data.amount).toFixed(2);

    const newTx = {
      id: newId,
      secure_token: token,
      vendor: 1,
      vendor_name: 'Ramesh Sharma',
      vendor_phone: '9876543210',
      shop_name: 'Sharma Kirana & General Store',
      upi_id: 'sharma.kirana@oksbi',
      customer: null,
      customer_name: data.customer_name || '',
      customer_phone: data.customer_phone || '',
      amount: amountVal,
      description: data.description || 'General Items',
      status: 'PENDING',
      dispute_reason: '',
      total_paid: '0.00',
      remaining_balance: amountVal,
      payments: [],
      customer_previous_balance: '0.00',
      is_claimed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    txs.unshift(newTx);
    saveStoredTransactions(txs);
    return formatTxWithQR(newTx);
  },

  getSummary: async () => {
    const txs = getStoredTransactions();
    
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
      // For customer view
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
    const txs = getStoredTransactions();
    const found = txs.find(t => t.secure_token === token);
    if (!found) throw new Error('Transaction token not found');
    return formatTxWithQR(found);
  },

  claim: async (token, customerData = {}) => {
    const txs = getStoredTransactions();
    const idx = txs.findIndex(t => t.secure_token === token);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = txs[idx];
    tx.customer = 2;
    tx.customer_name = customerData.customer_name || 'Rahul Verma';
    tx.customer_phone = customerData.customer_phone || '9812345678';
    tx.is_claimed = true;
    tx.customer_previous_balance = '2100.00';
    tx.updated_at = new Date().toISOString();

    txs[idx] = tx;
    saveStoredTransactions(txs);
    return {
      message: `Bill linked to ${tx.customer_name} successfully.`,
      transaction: formatTxWithQR(tx)
    };
  },

  respond: async (token, action, disputeReason = '') => {
    const txs = getStoredTransactions();
    const idx = txs.findIndex(t => t.secure_token === token);
    if (idx === -1) throw new Error('Transaction not found');

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

    if (!tx.customer_name) {
      tx.customer = 2;
      tx.customer_name = 'Rahul Verma';
      tx.customer_phone = '9812345678';
    }

    tx.updated_at = new Date().toISOString();
    txs[idx] = tx;
    saveStoredTransactions(txs);

    return {
      message: `Bill ${action.toLowerCase()}ed successfully!`,
      transaction: formatTxWithQR(tx)
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
    const username = userData.username;
    const isVendor = (userData.role || 'VENDOR') === 'VENDOR';
    const newUser = {
      id: Date.now(),
      username,
      name: userData.name || username,
      phone: userData.phone || '9876543210',
      role: userData.role || 'VENDOR',
      vendor_profile: isVendor ? {
        shop_name: userData.shop_name || `${userData.name || username}'s Store`,
        shop_category: userData.shop_category || 'Grocery & Provisions',
        address: userData.address || 'Market Center',
        upi_id: userData.upi_id || `${username}@upi`
      } : undefined,
      customer_profile: !isVendor ? {
        address: userData.address || 'Local Resident'
      } : undefined
    };
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
    return {
      status: 'sent',
      message: 'Reminder successfully sent to customer via SMS and WhatsApp!'
    };
  },

  markRead: async (id) => {
    return { status: 'success' };
  }
};

