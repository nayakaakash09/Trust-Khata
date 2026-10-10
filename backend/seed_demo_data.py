import os
import sys
import django
from decimal import Decimal

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, VendorProfile, CustomerProfile
from transactions.models import Transaction, PaymentRecord
from notifications.models import Notification

def seed():
    print("Clearing existing data for a clean seed...")
    Notification.objects.all().delete()
    PaymentRecord.objects.all().delete()
    Transaction.objects.all().delete()
    User.objects.all().delete()

    print("Creating demo users...")
    # 1. Admin
    admin = User.objects.create_superuser('admin', 'admin@trustkhata.local', 'admin123')
    admin.name = "Super Admin"
    admin.role = "VENDOR"
    admin.phone = "9000000000"
    admin.save()

    # 2. Vendor 1: Ramesh Sharma (Sharma Kirana Store)
    vendor1 = User.objects.create_user(
        username='sharma_kirana',
        password='password123',
        name='Ramesh Sharma',
        phone='9876543210',
        role='VENDOR',
        email='ramesh@sharmakirana.com'
    )
    VendorProfile.objects.create(
        user=vendor1,
        shop_name='Sharma Kirana & General Store',
        shop_category='Grocery & Provisions',
        address='Shop #14, Main Market, Sector 15, Gandhinagar',
        upi_id='sharma.kirana@oksbi'
    )

    # 3. Customer 1: Rahul Verma
    customer1 = User.objects.create_user(
        username='rahul_v',
        password='password123',
        name='Rahul Verma',
        phone='9812345678',
        role='CUSTOMER',
        email='rahul.verma@example.com'
    )
    CustomerProfile.objects.create(
        user=customer1,
        address='Flat 402, Green Valley Apts, Sector 15'
    )

    # 4. Customer 2: Priya Sharma
    customer2 = User.objects.create_user(
        username='priya_s',
        password='password123',
        name='Priya Sharma',
        phone='9823456789',
        role='CUSTOMER',
        email='priya.s@example.com'
    )
    CustomerProfile.objects.create(
        user=customer2,
        address='House 78, Street 4, Sector 16'
    )

    # 5. Customer 3: Amit Kumar
    customer3 = User.objects.create_user(
        username='amit_k',
        password='password123',
        name='Amit Kumar',
        phone='9834567890',
        role='CUSTOMER',
        email='amit.kumar@example.com'
    )
    CustomerProfile.objects.create(
        user=customer3,
        address='B-12, Krishna Colony'
    )

    print("Creating demo transactions...")

    # Tx 1: Accepted with partial payment (Rahul)
    tx1 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer1,
        customer_name=customer1.name,
        customer_phone=customer1.phone,
        amount=Decimal('1450.00'),
        description='Basmati Rice 5kg, Dal 2kg, Cooking Oil 2L & Masalas',
        status=Transaction.STATUS_ACCEPTED
    )
    PaymentRecord.objects.create(
        transaction=tx1,
        amount_paid=Decimal('500.00'),
        payment_mode=PaymentRecord.MODE_UPI,
        notes='UPI payment via PhonePe',
        recorded_by=vendor1
    )

    # Tx 2: Pending (Rahul) - awaiting QR verification!
    tx2 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer1,
        customer_name=customer1.name,
        customer_phone=customer1.phone,
        amount=Decimal('420.00'),
        description='Amul Milk 4L, Paneer 500g, Dahi 1kg',
        status=Transaction.STATUS_PENDING
    )

    # Tx 3: Accepted full unpaid (Rahul)
    tx3 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer1,
        customer_name=customer1.name,
        customer_phone=customer1.phone,
        amount=Decimal('850.00'),
        description='Aashirvaad Atta 10kg & Sugar 5kg',
        status=Transaction.STATUS_ACCEPTED
    )

    # Tx 4: Disputed (Rahul)
    tx4 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer1,
        customer_name=customer1.name,
        customer_phone=customer1.phone,
        amount=Decimal('320.00'),
        description='Tea 500g, Biscuits 4 pkts, Detergent bar',
        status=Transaction.STATUS_DISPUTED,
        dispute_reason='Quantity mismatch: billed for 4 biscuit packets instead of 2 packets actually received.'
    )

    # Tx 5: Paid in full (Rahul)
    tx5 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer1,
        customer_name=customer1.name,
        customer_phone=customer1.phone,
        amount=Decimal('600.00'),
        description='Detergent powder 3kg & Dishwash bar',
        status=Transaction.STATUS_PAID
    )
    PaymentRecord.objects.create(
        transaction=tx5,
        amount_paid=Decimal('600.00'),
        payment_mode=PaymentRecord.MODE_CASH,
        notes='Settled in full at shop counter in cash',
        recorded_by=vendor1
    )

    # Tx 6: Accepted (Priya)
    tx6 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer2,
        customer_name=customer2.name,
        customer_phone=customer2.phone,
        amount=Decimal('1200.00'),
        description='Monthly toiletries, shampoos, soaps and toothpastes',
        status=Transaction.STATUS_ACCEPTED
    )
    PaymentRecord.objects.create(
        transaction=tx6,
        amount_paid=Decimal('400.00'),
        payment_mode=PaymentRecord.MODE_UPI,
        notes='Initial token advance',
        recorded_by=vendor1
    )

    # Tx 7: Pending (Amit)
    tx7 = Transaction.objects.create(
        vendor=vendor1,
        customer=customer3,
        customer_name=customer3.name,
        customer_phone=customer3.phone,
        amount=Decimal('780.00'),
        description='Dry fruits pack: Almonds 250g, Cashews 250g',
        status=Transaction.STATUS_PENDING
    )

    print("Creating notifications...")
    Notification.objects.create(
        sender=vendor1,
        recipient=customer1,
        recipient_phone=customer1.phone,
        transaction=tx2,
        title="Verify Credit: Rs. 420.00",
        message="Sharma Kirana created a credit entry of Rs. 420.00 for 'Amul Milk 4L, Paneer 500g, Dahi 1kg'. Please verify.",
        notification_type=Notification.TYPE_STATUS_UPDATE
    )

    Notification.objects.create(
        sender=vendor1,
        recipient=customer1,
        recipient_phone=customer1.phone,
        transaction=tx1,
        title="Payment Acknowledgment: Rs. 500.00",
        message="Received Rs. 500.00 via UPI. Remaining credit balance on this bill: Rs. 950.00.",
        notification_type=Notification.TYPE_PAYMENT
    )

    print("Seeding completed successfully!")
    print("\n--- Demo Credentials ---")
    print("Vendor (Shopkeeper):")
    print("  Username: sharma_kirana")
    print("  Password: password123")
    print("  Phone: 9876543210")
    print("\nCustomer:")
    print("  Username: rahul_v")
    print("  Password: password123")
    print("  Phone: 9812345678")
    print("\nPending QR Verification Tx Token:")
    print(f"  Token: {tx2.secure_token}")
    print(f"  URL: /verify/{tx2.secure_token}")

if __name__ == '__main__':
    seed()
