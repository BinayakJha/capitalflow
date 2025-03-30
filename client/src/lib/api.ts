import { apiRequest } from './queryClient';
import { 
  NessieAccount, 
  NessieTransaction, 
  AIResponse, 
  IncomeStatement, 
  CashFlowStatement,
  Insight
} from '@shared/types';

// Financial data APIs
export async function fetchAccounts(): Promise<NessieAccount[]> {
  const response = await apiRequest('/api/accounts', 'GET', undefined);
  return response;
}

export async function fetchTransactions(accountId: string): Promise<NessieTransaction[]> {
  const response = await apiRequest(`/api/accounts/${accountId}/transactions`, 'GET', undefined);
  return response;
}

export async function fetchFinancialOverview(period: string = 'month'): Promise<{
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  change: number;
}> {
  const response = await apiRequest(`/api/financial/overview?period=${period}`, 'GET', undefined);
  return response;
}

export async function fetchRevenueExpenses(period: string = 'month'): Promise<{
  data: Array<{ date: string; revenue: number; expenses: number }>;
}> {
  const response = await apiRequest(`/api/financial/revenue-expenses?period=${period}`, 'GET', undefined);
  return response;
}

// AI chat APIs
export async function sendChatMessage(message: string): Promise<AIResponse> {
  const response = await apiRequest('/api/chat/message', 'POST', { message });
  return response;
}

export async function fetchChatHistory(): Promise<Array<{ role: 'user' | 'ai'; content: string; timestamp: string }>> {
  const response = await apiRequest('/api/chat/history', 'GET', undefined);
  return response;
}

// Insights APIs
export async function fetchInsights(): Promise<Insight[]> {
  const response = await apiRequest('/api/insights', 'GET', undefined);
  return response;
}

export async function markInsightAsRead(insightId: number): Promise<{ success: boolean }> {
  const response = await apiRequest(`/api/insights/${insightId}/read`, 'PATCH', undefined);
  return response;
}

// Document generation APIs
export async function generateIncomeStatement(params: {
  startDate: string;
  endDate: string;
}): Promise<IncomeStatement> {
  const response = await apiRequest('/api/documents/income-statement', 'POST', params);
  return response;
}

export async function generateCashFlowStatement(params: {
  startDate: string;
  endDate: string;
}): Promise<CashFlowStatement> {
  const response = await apiRequest('/api/documents/cash-flow', 'POST', params);
  return response;
}

export async function generatePDF(documentId: number): Promise<any> {
  const response = await apiRequest(`/api/documents/${documentId}/pdf`, 'GET', undefined);
  return response;
}

export async function fetchDocuments(): Promise<Array<{
  id: number;
  title: string;
  documentType: string;
  createdAt: string;
}>> {
  const response = await apiRequest('/api/documents', 'GET', undefined);
  return response;
}
