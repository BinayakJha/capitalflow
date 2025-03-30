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

# Helper: Get customer account
def get_customer_account():
    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/accounts?key={API_KEY}"
    response = requests.get(url)
    try:
        data = response.json()
        if isinstance(data, list) and data:
            return data[0]['_id']
        else:
            print("❌ Unexpected account data:", data)
            return None
    except Exception as e:
        print("❌ Failed to fetch account:", e)
        return None

# Helper: Generate random date
def random_date_in_month(year, month):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year, 12, 31)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    return start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

# Create mock merchants
def create_merchants(n=8):
    categories = [
    'Retail',
    'Food & Beverage',
    'Technology',
    'Healthcare',
    'Education',
    'Entertainment',
    'Travel & Tourism',
    'Professional Services',
    'Logistics',
    'Construction',
    'Real Estate',
    'Finance & Insurance',
    'Hospitality',
]
    merchant_ids = []

    for i in range(n):
        merchant_id = f"mock_merchant_{random.randint(10000, 99999)}"
        merchant_ids.append(merchant_id)
        print(f"[✔] Simulated merchant: {merchant_id} ({random.choice(categories)})")

    return merchant_ids

# Create transaction types
def create_deposit(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(2000, 10000), 2),
        "description": "Monthly business revenue"
    }
    url = f"{BASE_URL}/accounts/{account_id}/deposits?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_withdrawal(account_id, date):
    payload = {
        "medium": "balance",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "amount": round(random.uniform(500, 3000), 2),
        "description": "Utility or rent payment"
    }
    url = f"{BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_transfer(account_id, date):
    payload = {
        "medium": "balance",
        "payee_id": "external",
        "transaction_date": date.strftime('%Y-%m-%d'),
        "status": "completed",
        "description": "Loan repayment"
    }
    url = f"{BASE_URL}/accounts/{account_id}/transfers?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

def create_purchase(account_id, merchant_id, date):
    payload = {
        "merchant_id": merchant_id,
        "medium": "balance",
        "purchase_date": date.strftime('%Y-%m-%d'),
        "amount": round(random.uniform(100, 2500), 2),
        "status": "completed",
        "description": "Business supplies or inventory"
    }
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    return requests.post(url, json=payload, headers=HEADERS)

# Simulate realistic small business from 2020 to 2025
def simulate_business():
    account_id = get_customer_account()
    if not account_id:
        return "No account found."

    merchants = create_merchants(8)
    if not merchants:
        return "No merchants created."

    for year in range(2020, 2026):
        for month in range(1, 13):
            for _ in range(random.randint(5, 10)):
                date = random_date_in_month(year, month)
                create_deposit(account_id, date)
                print(f"[✔] Created deposit for {date.strftime('%Y-%m-%d')}")
                create_withdrawal(account_id, date)
                print(f"[✔] Created withdrawal for {date.strftime('%Y-%m-%d')}")
                create_transfer(account_id, date)
                print(f"[✔] Created transfer for {date.strftime('%Y-%m-%d')}")
                create_purchase(account_id, random.choice(merchants), date)
                print(f"[✔] Created purchase for {date.strftime('%Y-%m-%d')}")
    return "Business simulation complete."

simulate_business()
