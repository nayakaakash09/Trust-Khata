# Trust Khata — API Specification & Contract

This document outlines the API contracts agreed upon by backend and frontend teams.

## Base URL
`http://127.0.0.1:8000/api`

---

## 1. Authentication (`/accounts/`)

### Register User
- **Endpoint**: `POST /accounts/register/`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "sharma_kirana",
    "password": "password123",
    "name": "Ramesh Sharma",
    "phone": "9876543210",
    "role": "VENDOR", // or "CUSTOMER"
    "shop_name": "Sharma Kirana & General Store", // vendor only
    "shop_category": "Grocery", // vendor only
    "address": "Shop #14, Main Market",
    "upi_id": "sharma@upi" // vendor only
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "user": { "id": 2, "username": "sharma_kirana", "name": "Ramesh Sharma", "role": "VENDOR", ... },
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "message": "Account created successfully!"
  }
  ```

### Login
- **Endpoint**: `POST /accounts/login/`
- **Request Body**:
  ```json
  {
    "username": "sharma_kirana",
    "password": "password123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access": "<jwt_token>",
    "refresh": "<refresh_token>",
    "user": { ... }
  }
  ```

---

## 2. Transactions & Ledger (`/transactions/`)

### List Transactions
- **Endpoint**: `GET /transactions/?status=ACCEPTED&search=Rahul`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of transaction objects.

### Create Transaction
- **Endpoint**: `POST /transactions/`
- **Permission**: Vendor Only
- **Request Body**:
  ```json
  {
    "customer_name": "Rahul Verma",
    "customer_phone": "9812345678",
    "amount": 420.00,
    "description": "Amul Milk 4L, Paneer 500g"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 12,
    "secure_token": "a83134d3-5473-406f-9264-f484d75abaff",
    "amount": "420.00",
    "status": "PENDING",
    "qr_code": "data:image/png;base64,...",
    "verification_url": "/verify/a83134d3-5473-406f-9264-f484d75abaff"
  }
  ```

### Verify by Unguessable Token
- **Endpoint**: `GET /transactions/verify/<uuid:token>/`
- **Access**: Public / Customer

### Customer Respond (Accept / Dispute / Reject)
- **Endpoint**: `POST /transactions/verify/<uuid:token>/respond/`
- **Permission**: Customer (Authenticated)
- **Request Body**:
  ```json
  {
    "action": "ACCEPT" // or "DISPUTE" / "REJECT",
    "dispute_reason": "Billed for 2 items instead of 1" // required if DISPUTE
  }
  ```

### Record Payment (Settlement)
- **Endpoint**: `POST /transactions/<id>/payments/`
- **Permission**: Vendor Only
- **Request Body**:
  ```json
  {
    "amount_paid": 200.00,
    "payment_mode": "CASH", // or "UPI", "OTHER"
    "notes": "Paid at shop counter"
  }
  ```
- **Response**: Updates `total_paid` and `remaining_balance`. If `remaining_balance == 0`, status auto-updates to `PAID`.

### Ledger Summary
- **Endpoint**: `GET /transactions/summary/`
- Dynamically calculates totals from valid accepted transactions and payment records (server-side computed).

---

## 3. Notifications & Reminders (`/notifications/`)

### Send Reminder
- **Endpoint**: `POST /notifications/remind/`
- **Request Body**:
  ```json
  {
    "transaction_id": 12,
    "message": "Optional custom note"
  }
  ```
- **Response**: Creates in-app notification and returns pre-formatted WhatsApp share link text.
