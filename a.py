import random
from datetime import datetime, timedelta
import requests

# Constants
API_KEY = 'ca321c1a9bbb97c3811f2bb7f597b9de'
BASE_URL = 'http://api.nessieisreal.com'
CUSTOMER_ID = '67e8c8179683f20dd5193dc3'

HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

# Utility Functions
def get_customer_account():
    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/accounts?key={API_KEY}"
    response = requests.get(url)
    try:
        data = response.json()
        if isinstance(data, list) and data:
            return data[0]['_id']
        print("❌ Unexpected account data:", data)
    except Exception as e:
        print("❌ Failed to fetch account:", e)
    return None

def random_date_in_month(year, month):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year, 12, 31)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    return start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

def create_merchants(n=10):
    categories = [
        'Retail', 'Food & Beverage', 'Technology', 'Healthcare', 'Education',
        'Entertainment', 'Logistics', 'Construction', 'Real Estate', 'Finance'
    ]
    merchant_ids = []
    for i in range(n):
        merchant_id = f"merchant_{random.randint(10000, 99999)}"
        merchant_ids.append(merchant_id)
        print(f"[✔] Merchant created: {merchant_id} ({random.choice(categories)})")
    return merchant_ids

# Transaction Types
def create_deposit(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(5000, 15000), 2),
        "description": random.choice([
            "Monthly business revenue", "Service Income", "Freelance Payment", "Product Sale"
        ])
    }
    url = f"{BASE_URL}/accounts/{account_id}/deposits?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_withdrawal(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(1000, 5000), 2),
        "description": random.choice([
            "Rent Payment", "Utility Bill", "Software Subscription", "Insurance Premium", 
            "Employee Salary", "Marketing Expense", "Legal Consultation", "Tax Payment"
        ])
    }
    url = f"{BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_transfer(account_id, date):
    payload = {
        "medium": "balance",
        "payee_id": "external",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "description": random.choice(["Loan Repayment", "Interbank Transfer"])
    }
    url = f"{BASE_URL}/accounts/{account_id}/transfers?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_purchase(account_id, merchant_id, date):
    payload = {
        "merchant_id": merchant_id,
        "medium": "balance",
        "purchase_date": date.strftime('%Y-%m-%d'),
        "amount": round(random.uniform(200, 2500), 2),
        "status": "completed",
        "description": random.choice([
            "Inventory Purchase", "Office Supplies", "Laptop", "Travel Booking", 
            "Training Workshop", "Furniture", "Business Software", "Ad Spend"
        ])
    }
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_investment(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(3000, 10000), 2),
        "description": random.choice(["Equipment Purchase", "Asset Acquisition"])
    }
    url = f"{BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}"  # Investment = cash out
    return requests.post(url, json=payload, headers=HEADERS)

def create_loan_proceeds(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(10000, 30000), 2),
        "description": "Loan Received from Lender"
    }
    url = f"{BASE_URL}/accounts/{account_id}/deposits?key={API_KEY}"  # Loan proceeds = cash in
    return requests.post(url, json=payload, headers=HEADERS)

# Main Simulation Loop
def simulate_business():
    account_id = get_customer_account()
    if not account_id:
        return "❌ No account found."

    merchants = create_merchants(10)
    if not merchants:
        return "❌ No merchants created."

    for year in range(2025, 2026):
        for month in range(1, 6):
            print(f"\n📅 Simulating for {year}-{month:02d}")
            for _ in range(random.randint(5, 8)):
                date = random_date_in_month(year, month)
                create_deposit(account_id, date)
                create_withdrawal(account_id, date)
                create_purchase(account_id, random.choice(merchants), date)
                create_transfer(account_id, date)
                
                # Randomized extra financial activity
                if random.random() < 0.3:
                    create_investment(account_id, date)
                    print(f"[💼] Investment made on {date.strftime('%Y-%m-%d')}")
                if random.random() < 0.2:
                    create_loan_proceeds(account_id, date)
                    print(f"[💰] Loan proceeds received on {date.strftime('%Y-%m-%d')}")

    return "✅ Business simulation complete!"

# 🔃 Run the simulation
simulate_business()
