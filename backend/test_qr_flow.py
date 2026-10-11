import urllib.request
import json

BASE = "http://127.0.0.1:8000/api"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE}{endpoint}"
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. Login as Vendor
v_res = request("/accounts/login/", "POST", {"username": "sharma_kirana", "password": "password123"})
v_token = v_res['access']

# 2. Vendor creates transaction ONLY with amount and description (NO customer details entered!)
tx = request("/transactions/", "POST", {
    "amount": 450.00,
    "description": "Atta 5kg, Cooking Oil 1L, Spices"
}, token=v_token)
token = tx['secure_token']
print("1. Vendor Created Bill:")
print(f"   ID: {tx['id']} | Amount: Rs. {tx['amount']} | Items: {tx['description']}")
print(f"   Initial Customer: '{tx['customer_name']}' (Unassigned)")
print(f"   Status: {tx['status']} | Has QR: {bool(tx.get('qr_code'))}")

# 3. Customer Rahul Verma logs in and claims/scans the QR
c_res = request("/accounts/login/", "POST", {"username": "rahul_v", "password": "password123"})
c_token = c_res['access']

claim_res = request(f"/transactions/verify/{token}/claim/", "POST", {}, token=c_token)
claimed_tx = claim_res['transaction']
print("\n2. Customer Scanned & Claimed Bill:")
print(f"   Customer Attached: {claimed_tx['customer_name']} ({claimed_tx['customer_phone']})")
print(f"   Previous Balance: Rs. {claimed_tx.get('customer_previous_balance')}")

# 4. Customer Accepts bill
resp = request(f"/transactions/verify/{token}/respond/", "POST", {"action": "ACCEPT"}, token=c_token)
print("\n3. Customer Accepted Bill:")
print(f"   Status in Ledger: {resp['transaction']['status']}")
print("\nTEST COMPLETED SUCCESSFULLY!")
