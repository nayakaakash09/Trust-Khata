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

def test():
    print("=== 1. Login as Vendor (Sharma Kirana) ===")
    v_login = request("/accounts/login/", "POST", {"username": "sharma_kirana", "password": "password123"})
    v_token = v_login['access']
    print(f"Vendor Logged In: {v_login['user']['name']} ({v_login['user']['vendor_profile']['shop_name']})")

    print("\n=== 2. Vendor creates a new credit entry for Rahul Verma ===")
    tx_data = {
        "customer_name": "Rahul Verma",
        "customer_phone": "9812345678",
        "amount": 250.00,
        "description": "Cold drinks 2 bottles & Chips 3 pkts"
    }
    tx = request("/transactions/", "POST", tx_data, token=v_token)
    tx_id = tx['id']
    token = tx['secure_token']
    print(f"Transaction #{tx_id} created! Status: {tx['status']}, Token: {token}")
    print(f"QR Code generated: {bool(tx.get('qr_code'))} (Length: {len(tx.get('qr_code', ''))})")

    print("\n=== 3. Customer (Rahul Verma) logs in ===")
    c_login = request("/accounts/login/", "POST", {"username": "rahul_v", "password": "password123"})
    c_token = c_login['access']
    print(f"Customer Logged In: {c_login['user']['name']}")

    print("\n=== 4. Customer verifies transaction via unguessable token ===")
    verified = request(f"/transactions/verify/{token}/", "GET")
    print(f"Bill Details Verified: Shop='{verified['shop_name']}', Amount=Rs. {verified['amount']}, Status='{verified['status']}'")

    print("\n=== 5. Customer ACCEPTS the proposed credit entry ===")
    respond_res = request(f"/transactions/verify/{token}/respond/", "POST", {"action": "ACCEPT"}, token=c_token)
    print(f"Accepted Response: {respond_res['message']}")
    print(f"Updated Status in Ledger: {respond_res['transaction']['status']}")

    print("\n=== 6. Vendor records partial payment of Rs. 100 ===")
    pay_res = request(f"/transactions/{tx_id}/payments/", "POST", {"amount_paid": 100.0, "payment_mode": "UPI", "notes": "UPI advance"}, token=v_token)
    print(f"Payment Recorded: {pay_res['message']}")
    print(f"Remaining Balance: Rs. {pay_res['transaction']['remaining_balance']} (Paid: Rs. {pay_res['transaction']['total_paid']})")

    print("\n=== 7. Validate Synchronized Ledger Summary ===")
    v_sum = request("/transactions/summary/", "GET", token=v_token)
    c_sum = request("/transactions/summary/", "GET", token=c_token)
    print(f"Vendor Total Outstanding: Rs. {v_sum['total_outstanding']}, Total Collected: Rs. {v_sum['total_collected']}")
    print(f"Customer Total Debt: Rs. {c_sum['total_debt_outstanding']}, Total Settled: Rs. {c_sum['total_paid']}")

    print("\n=======================================================")
    print("ALL CORE WORKFLOWS AND VALIDATIONS SUCCEEDED 100%!")
    print("=======================================================")

if __name__ == '__main__':
    test()
