// Nessie API types
export interface NessieAccount {
  _id: string;
  type: string;
  nickname: string;
  rewards: number;
  balance: number;
  account_number: string;
  customer_id: string;
}

export interface NessieTransaction {
  _id: string;
  type: string;
  transaction_date: string;
  status: string;
  amount: number;
  description: string;
  payer_id: string;
  medium: string;
  payee_id: string;
}

export interface NessieCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  address: NessieAddress;
}

export interface NessieAddress {
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip: string;
}

// AI Response types
export interface AIResponse {
  text: string;
  sourceDocuments?: any[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}

// Financial data types
export interface FinancialMetric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  period?: string;
}

export interface RevenueExpenseData {
  date: string;
  revenue: number;
  expenses: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

// Document types
export interface IncomeStatement {
  periodStart: string;
  periodEnd: string;
  revenue: {
    total: number;
    categories: CategoryBreakdown[];
  };
  expenses: {
    total: number;
    categories: CategoryBreakdown[];
  };
  profit: number;
  profitMargin: number;
}

export interface CashFlowStatement {
  periodStart: string;
  periodEnd: string;
  operatingActivities: {
    netIncome: number;
    adjustments: Array<{
      description: string;
      amount: number;
    }>;
    netCash: number;
  };
  investingActivities: {
    items: Array<{
      description: string;
      amount: number;
    }>;
    netCash: number;
  };
  financingActivities: {
    items: Array<{
      description: string;
      amount: number;
    }>;
    netCash: number;
  };
  netChange: number;
  startingBalance: number;
  endingBalance: number;
}

// Insight types
export interface Insight {
  id: number;
  content: string;
  category: string;
  timestamp: Date;
  isRead: boolean;
}

// Loan approval calculator types
export type LoanType = 'SBA Loan' | 'Term Loan' | 'Line of Credit' | 'Revenue-Based Financing';

export interface LoanApprovalInput {
  loanType: LoanType;
  loanAmount: number;
  collateral: {
    available: boolean;
    type: string;
    value: number;
  };
  businessInfo: {
    ageInMonths: number;
    industry: string;
    annualRevenue: number;
  };
  ownerInfo: {
    creditScore: number;
    ficoScore?: number;
  };
  cashFlow?: {
    monthlyCashFlow: number;
    debtToIncomeRatio: number;
    profitMargin: number;
  };
}

export interface LoanApprovalResult {
  approvalProbability: number; // 0-100
  suggestedLoanType: LoanType;
  timeToFunding: string;
  requiredDocuments: string[];
  improvements: string[];
  pros: string[];
  cons: string[];
}
