# Trust Khata (विश्वास खाता) — Verified Digital Credit Ledger

[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/Auth-SimpleJWT-orange.svg)](https://jwt.io/)

Trust Khata is a digital credit ledger built for local shopkeepers and customers to record, verify, and track credit transactions without relying on paper notebooks (*khata bahi*).

### 🌟 The Core Differentiator
Traditional paper khatas lead to disputes because customers often forget what was purchased or contest bills weeks later. 
**With Trust Khata:**
1. The shopkeeper enters a credit transaction.
2. The system generates a secure, unguessable **QR code and verification link**.
3. The customer scans the QR code on their own phone, reviews the exact amount & items, and clicks **Accept** (or **Dispute**).
4. Only verified entries enter the synchronized shared ledger!

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 19 + Vite | High performance single-page application |
| **Styling** | Modern CSS + Tokens | Glassmorphism, tailored emerald/slate theme, micro-animations |
| **Backend** | Python 3.12 + Django 6.1 + DRF | Clean REST API with state validation |
| **Authentication** | Django Auth + SimpleJWT | Role-based token auth (Vendor & Customer) |
| **QR Generation** | Python `qrcode` + Pillow | Unguessable token Base64 data URLs |
| **QR Scanning** | Browser camera + manual resolver | Camera stream & 1-click test token resolver |
| **Database** | SQLite3 (dev) / PostgreSQL (prod) | Relational integrity with atomic balance recalculation |

---

## 📂 Repository Structure

```
Trust-Khata/
├── backend/
│   ├── config/             # Django root (settings, routing, WSGI/ASGI)
│   ├── accounts/           # User authentication, roles & shop profiles
│   ├── transactions/       # Credit transactions, QR generator & settlements
│   ├── notifications/      # Payment reminders & WhatsApp preview generator
│   ├── seed_demo_data.py   # One-click demo data populator
│   ├── test_flow.py        # Automated end-to-end integration test
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, StatusBadge, QRModal, PaymentModal, ReminderModal
│   │   ├── context/        # AuthContext with 1-click persona switcher
│   │   ├── pages/          # Login, VendorDashboard, CustomerDashboard, CreateTx, VerifyTx, Scanner, SharedLedger
│   │   ├── services/       # api.js API client
│   │   ├── App.jsx
│   │   └── index.css       # Complete design token system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── api_contract.md     # Full REST API contracts & payloads
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed rich sample demo data (Ramesh Sharma & Rahul Verma)
python seed_demo_data.py

# Start Django development server (Port 8000)
python manage.py runserver 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server (Port 5173)
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser!

---

## 🔑 Quick Demo Credentials (Pre-seeded)

Use the built-in **1-Click Quick Demo Switcher** at the top right of the navigation bar or on the login screen:

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Vendor (Shopkeeper)** | `sharma_kirana` | `password123` | Ramesh Sharma (Sharma Kirana Store) |
| **Customer 1** | `rahul_v` | `password123` | Rahul Verma (Has pending verification bill & partial payments) |
| **Customer 2** | `priya_s` | `password123` | Priya Sharma (Clean active customer) |

---

## 📱 Core User Journeys

### 1. Vendor: Recording Credit & Generating QR
- Go to **Create Credit** (`/vendor/create`).
- Select customer or enter mobile number, amount, and items.
- Click **Create Credit & Generate QR Code**.
- A high-resolution QR modal pops up with the direct verification link.

### 2. Customer: Scanning & Confirming Bill
- Customer opens camera or uses **Scan QR** (`/scan`).
- Reviews the proposed bill items, merchant name, and exact amount.
- Clicks **Accept Credit Entry** (celebration confetti triggers and entry is confirmed) or **Dispute Entry** with a reason.

### 3. Vendor: Recording Payment
- From the Shop Dashboard, click **Settle** on any accepted bill.
- Enter partial or full payment amount and select payment mode (Cash/UPI).
- The ledger balance updates dynamically in real-time.

### 4. Vendor: Sending Payment Reminder
- Click the **Bell Reminder** button on any unpaid bill.
- Review the polite customized reminder template and click **Open in WhatsApp** to message the customer directly!

---

## 👥 Team Responsibilities & GitHub Collaboration

| Member | Responsibility | Assigned Directory / Focus |
|--------|----------------|----------------------------|
| **Team Lead** | Database models, balance calculation logic & GitHub coordination | `backend/transactions`, `backend/config` |
| **Teammate 1** | Django authentication, roles, JWT endpoints | `backend/accounts` |
| **Teammate 2** | React vendor dashboard, metrics cards, credit creation | `frontend/src/pages/VendorDashboard.jsx`, `CreateTransaction.jsx` |
| **Teammate 3** | React customer dashboard, QR verification UI, scanning | `frontend/src/pages/CustomerDashboard.jsx`, `VerifyTransaction.jsx`, `QRScannerPage.jsx` |

### Git Workflow:
```bash
# Branch out for feature
git switch -c feature/vendor-dashboard

# Make changes and commit
git add .
git commit -m "Build vendor dashboard and credit form"

# Push and open PR into main
git push -u origin feature/vendor-dashboard
```
