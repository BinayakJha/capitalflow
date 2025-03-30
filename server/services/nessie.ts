import axios from 'axios';
import { NessieAccount, NessieTransaction, NessieCustomer } from '@shared/types';

// Capital One Nessie API configuration
const API_KEY = process.env.NESSIE_API_KEY || 'ca321c1a9bbb97c3811f2bb7f597b9de';
const BASE_URL = 'http://api.nessieisreal.com/';
const DEFAULT_CUSTOMER_ID = '67e8c8179683f20dd5193dc3'; 
/**
 * Nessie API Documentation:
 * - Accounts: /accounts, /accounts/{id}, /customers/{id}/accounts
 * - Customers: /customers, /customers/{id}, /accounts/{id}/customer
 * - Transactions: 
 *   - Deposits: /accounts/{id}/deposits, /deposits/{id}
 *   - Withdrawals: /accounts/{id}/withdrawals, /withdrawals/{id}
 *   - Transfers: /accounts/{id}/transfers, /transfers/{id}
 *   - Purchases: /accounts/{id}/purchases, /purchases/{id}, /merchants/{id}/purchases
 */

// Configure Axios to handle Nessie API properly
const nessieApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add API key to every request
nessieApi.interceptors.request.use(config => {
  config.params = config.params || {};
  config.params.key = API_KEY;
  return config;
});

// Helper function to safely parse API response
const safeParseResponse = (response: any): any[] => {
  if (!response || !response.data) {
    return [];
  }
  
  // Handle response with 'results' array
  if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  // Handle direct array response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle single object response
  if (typeof response.data === 'object' && !Array.isArray(response.data)) {
    return [response.data];
  }
  
  return [];
};

// Fetch all accounts or accounts for a specific customer
export async function fetchAccounts(customerId: string = DEFAULT_CUSTOMER_ID): Promise<NessieAccount[]> {
  try {
    console.log(`Fetching accounts from Nessie API, customerId: ${customerId}`);
    
    let response;
    
    // First try to get customer's accounts using the documented endpoint
    try {
      response = await nessieApi.get(`/customers/${customerId}/accounts`);
      const accounts = safeParseResponse(response);
      
      if (accounts.length > 0) {
        console.log(`Found ${accounts.length} accounts for customer ${customerId}`);
        return accounts;
      }
    } catch (customerError: any) {
      console.warn(`Failed to fetch accounts for customer ${customerId}:`, customerError.message);
    }
    
    // If that fails, try getting all accounts
    try {
      response = await nessieApi.get('/accounts');
      const allAccounts = safeParseResponse(response);
      
      if (allAccounts.length > 0) {
        console.log(`Found ${allAccounts.length} total accounts`);
        
        // Filter accounts by customer ID if provided
        if (customerId) {
          const filteredAccounts = allAccounts.filter(
            (account: NessieAccount) => account.customer_id === customerId
          );
          
          if (filteredAccounts.length > 0) {
            console.log(`Filtered to ${filteredAccounts.length} accounts for customer ${customerId}`);
            return filteredAccounts;
          }
        }
        
        return allAccounts;
      }
    } catch (allError: any) {
      console.error('Failed to fetch all accounts:', allError.message);
    }
    
    // If we get here, we couldn't get any accounts
    throw new Error('Could not fetch any accounts from the API');
  } catch (error: any) {
    console.error('Error fetching accounts from Nessie API:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    // Return sample accounts for development
    console.log('Using mock account data due to API error');
    return [
      {
        _id: 'acct123456',
        type: 'Checking',
        nickname: 'Primary Checking',
        rewards: 0,
        balance: 15240,
        account_number: '1234567890',
        customer_id: DEFAULT_CUSTOMER_ID
      },
      {
        _id: 'acct234567',
        type: 'Savings',
        nickname: 'Business Savings',
        rewards: 0,
        balance: 34500,
        account_number: '2345678901',
        customer_id: DEFAULT_CUSTOMER_ID
      },
      {
        _id: 'acct345678',
        type: 'Credit Card',
        nickname: 'Business Credit Card',
        rewards: 420,
        balance: -2150,
        account_number: '3456789012',
        customer_id: DEFAULT_CUSTOMER_ID
      }
    ];
  }
}

// Fetch transactions for a specific account
export async function fetchAccountTransactions(accountId: string): Promise<NessieTransaction[]> {
  try {
    console.log(`Fetching transactions for account ${accountId} from Nessie API`);
    
    // According to the Nessie API documentation, transactions are split into 
    // different types: deposits, withdrawals, transfers, and purchases
    
    let allTransactions: NessieTransaction[] = [];
    
    // Try to fetch deposits for this account
    try {
      console.log(`Fetching deposits for account ${accountId}`);
      const depositsResponse = await nessieApi.get(`/accounts/${accountId}/deposits`);
      const deposits = safeParseResponse(depositsResponse);
      
      if (deposits.length > 0) {
        console.log(`Found ${deposits.length} deposits for account ${accountId}`);
        allTransactions = [...allTransactions, ...deposits];
      }
    } catch (depositError: any) {
      console.warn(`Failed to fetch deposits for account ${accountId}:`, depositError.message);
    }
    
    // Try to fetch withdrawals for this account
    try {
      console.log(`Fetching withdrawals for account ${accountId}`);
      const withdrawalsResponse = await nessieApi.get(`/accounts/${accountId}/withdrawals`);
      const withdrawals = safeParseResponse(withdrawalsResponse);
      
      if (withdrawals.length > 0) {
        console.log(`Found ${withdrawals.length} withdrawals for account ${accountId}`);
        allTransactions = [...allTransactions, ...withdrawals];
      }
    } catch (withdrawalError: any) {
      console.warn(`Failed to fetch withdrawals for account ${accountId}:`, withdrawalError.message);
    }
    
    // Try to fetch purchases for this account
    try {
      console.log(`Fetching purchases for account ${accountId}`);
      const purchasesResponse = await nessieApi.get(`/accounts/${accountId}/purchases`);
      const purchases = safeParseResponse(purchasesResponse);
      
      if (purchases.length > 0) {
        console.log(`Found ${purchases.length} purchases for account ${accountId}`);
        allTransactions = [...allTransactions, ...purchases];
      }
    } catch (purchasesError: any) {
      console.warn(`Failed to fetch purchases for account ${accountId}:`, purchasesError.message);
    }
    
    // Try to fetch transfers for this account
    try {
      console.log(`Fetching transfers for account ${accountId}`);
      const transfersResponse = await nessieApi.get(`/accounts/${accountId}/transfers`);
      const transfers = safeParseResponse(transfersResponse);
      
      if (transfers.length > 0) {
        console.log(`Found ${transfers.length} transfers for account ${accountId}`);
        allTransactions = [...allTransactions, ...transfers];
      }
    } catch (transfersError: any) {
      console.warn(`Failed to fetch transfers for account ${accountId}:`, transfersError.message);
    }
    
    // If we found any transactions, return them
    if (allTransactions.length > 0) {
      console.log(`Successfully fetched ${allTransactions.length} total transactions for account ${accountId}`);
      return allTransactions;
    }
    
    // If we get here, we couldn't get any transactions
    console.log('No transactions found through any method');
    
    // Generate mock data for development
    console.log('Using mock transaction data due to API error');
    return generateMockTransactions(accountId);
  } catch (error: any) {
    console.error(`Error in main fetchAccountTransactions function:`, error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    // Generate realistic mock data based on account type
    console.log('Using mock transaction data due to API error');
    return generateMockTransactions(accountId);
  }
}

// Helper function to generate realistic mock transactions
function generateMockTransactions(accountId: string): NessieTransaction[] {
  const transactionTypes = ['withdrawal', 'deposit', 'payment', 'invoice'];
  const descriptions = [
    'Vendor payment', 
    'Client invoice', 
    'Utilities', 
    'Office supplies', 
    'Subscription',
    'Consulting fees',
    'Equipment purchase',
    'Software license',
    'Insurance payment',
    'Marketing expenses'
  ];
  
  // Generate 10-20 random transactions
  const count = Math.floor(Math.random() * 10) + 10;
  const transactions: NessieTransaction[] = [];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.6; // 40% chance of being income
    const amount = isIncome 
      ? Math.floor(Math.random() * 5000) + 1000 
      : Math.floor(Math.random() * 2000) + 100;
    
    // Random date in the last 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    transactions.push({
      _id: `trans${i}${accountId}`,
      type: isIncome ? 'deposit' : transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      transaction_date: date.toISOString(),
      status: 'completed',
      amount: isIncome ? amount : -amount,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      payer_id: isIncome ? 'external' : 'self',
      medium: 'balance',
      payee_id: isIncome ? 'self' : 'external'
    });
  }
  
  return transactions;
}

// Fetch customer information
export async function fetchCustomer(customerId: string): Promise<NessieCustomer> {
  try {
    console.log(`Fetching customer information for ${customerId} from Nessie API`);
    
    // First try to get a specific customer directly
    try {
      const response = await nessieApi.get(`/customers/${customerId}`);
      if (response.data) {
        console.log('Successfully fetched customer directly');
        return response.data;
      }
    } catch (directError: any) {
      console.warn(`Direct customer fetch failed for ID ${customerId}:`, directError.message);
    }
    
    // If direct fetch fails, try getting all customers and filter
    try {
      const allResponse = await nessieApi.get('/customers');
      const customers = safeParseResponse(allResponse);
      
      if (customers.length > 0) {
        console.log(`Found ${customers.length} total customers, searching for ID ${customerId}`);
        const foundCustomer = customers.find((c: NessieCustomer) => c._id === customerId);
        
        if (foundCustomer) {
          console.log('Found customer by filtering all customers');
          return foundCustomer;
        }
      }
      
      // If we get here, we found customers but not the one we want
      throw new Error(`Customer with ID ${customerId} not found in customers list`);
    } catch (allError: any) {
      console.warn('Could not fetch or filter all customers:', allError.message);
      throw new Error(`Could not fetch customer with ID ${customerId}`);
    }
  } catch (error: any) {
    console.error(`Error fetching customer ${customerId}:`, error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    // Return sample customer for development
    console.log('Using mock customer data due to API error');
    return {
      _id: customerId || DEFAULT_CUSTOMER_ID,
      first_name: 'Jane',
      last_name: 'Smith',
      address: {
        street_number: '123',
        street_name: 'Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    };
  }
}

// Create a new account
export async function createAccount(customerId: string, type: string, nickname: string, balance: number) {
  try {
    console.log(`Creating new account for customer ${customerId} with Nessie API`);
    const accountData = {
      type,
      nickname,
      balance,
      account_number: Math.floor(Math.random() * 9000000000) + 1000000000,
      customer_id: customerId
    };
    
    const response = await nessieApi.post('/accounts', accountData);
    console.log('Account created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating account:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error('Failed to create account');
  }
}

// Create a new transaction
export async function createTransaction(
  accountId: string, 
  amount: number, 
  description: string, 
  type: string
) {
  try {
    console.log(`Creating new ${type} transaction for account ${accountId} with Nessie API`);
    const transactionData = {
      medium: 'balance',
      amount,
      description,
      status: 'pending',
      type
    };
    
    const response = await nessieApi.post(`/accounts/${accountId}/transactions`, transactionData);
    console.log('Transaction created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating transaction:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error('Failed to create transaction');
  }
}

// Get all customers
export async function fetchAllCustomers(): Promise<NessieCustomer[]> {
  try {
    console.log('Fetching all customers from Nessie API');
    
    const response = await nessieApi.get('/customers');
    const customers = safeParseResponse(response);
    
    if (customers.length > 0) {
      console.log(`Found ${customers.length} customers`);
      return customers;
    }
    
    console.log('No customers found or empty response from API');
    return [];
  } catch (error: any) {
    console.error('Error fetching customers:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    // Return empty array in case of error
    return [];
  }
}

// Create a new customer
export async function createCustomer(firstName: string, lastName: string, address: NessieCustomer['address']): Promise<NessieCustomer> {
  try {
    console.log(`Creating new customer: ${firstName} ${lastName}`);
    const customerData = {
      first_name: firstName,
      last_name: lastName,
      address: address || {
        street_number: '123',
        street_name: 'Main Street', 
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    };
    
    const response = await nessieApi.post('/customers', customerData);
    console.log('Customer created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error('Failed to create customer');
  }
}

// Delete an account
export async function deleteAccount(accountId: string): Promise<void> {
  try {
    console.log(`Deleting account ${accountId}`);
    await nessieApi.delete(`/accounts/${accountId}`);
    console.log('Account deleted successfully');
  } catch (error: any) {
    console.error(`Error deleting account ${accountId}:`, error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error('Failed to delete account');
  }
}

// Update account details
export async function updateAccount(accountId: string, updates: Partial<Omit<NessieAccount, '_id'>>): Promise<NessieAccount> {
  try {
    console.log(`Updating account ${accountId}`);
    const response = await nessieApi.put(`/accounts/${accountId}`, updates);
    console.log('Account updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating account ${accountId}:`, error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error('Failed to update account');
  }
}
