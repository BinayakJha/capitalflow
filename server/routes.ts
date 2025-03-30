import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchAccounts, fetchAccountTransactions, fetchCustomer } from "./services/nessie";
import { generateAIResponse, generateFinancialStatement, generateCashFlow } from "./services/ai";
import { User, insertChatMessageSchema, insertInsightSchema } from "@shared/schema";
import { NessieTransaction } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firebaseId, email, displayName, username, password } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByFirebaseId(firebaseId);
      if (existingUser) {
        return res.json({ success: true, userId: existingUser.id });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        firebaseId,
        email,
        displayName,
        username,
        password
      });
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ 
        success: false, 
        message: (error as Error).message || 'Failed to register user' 
      });
    }
  });

  // Account routes
  app.get('/api/accounts', async (req, res) => {
    try {
      const accounts = await fetchAccounts();
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch accounts' 
      });
    }
  });

  app.get('/api/accounts/:accountId/transactions', async (req, res) => {
    try {
      const { accountId } = req.params;
      const transactions = await fetchAccountTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch transactions' 
      });
    }
  });

  // Financial overview routes
  app.get('/api/financial/overview', async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const accounts = await fetchAccounts();
      
      // Calculate revenue, expenses from transactions
      let revenue = 0;
      let expenses = 0;
      let allTransactions = [];
      
      // This is a simplified example - in a real app, you'd process all transactions
      // based on the period requested
      for (const account of accounts) {
        const accountTransactions = await fetchAccountTransactions(account._id);
        allTransactions = [...allTransactions, ...accountTransactions];
        
        for (const transaction of accountTransactions) {
          if (transaction.type === 'deposit') {
            revenue += transaction.amount;
          } else if (transaction.type === 'withdrawal') {
            expenses += Math.abs(transaction.amount);
          }
        }
      }
      
      const profit = revenue - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      // Random change for demo - in a real app, you'd compare with previous period
      const change = Math.round((Math.random() * 10 - 2) * 10) / 10;
      
      res.json({
        revenue,
        expenses,
        profit,
        profitMargin,
        change
      });
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch financial overview' 
      });
    }
  });

  app.get('/api/financial/revenue-expenses', async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const accounts = await fetchAccounts();
      
      // Generate some data points based on real transactions
      // In a real app, you'd group transactions by date
      const dataPoints = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      
      // Create 12 data points (e.g., for the last 12 months)
      for (let i = 0; i < 12; i++) {
        const monthIndex = (now.getMonth() - i + 12) % 12;
        
        // In a real app, this would come from aggregated transaction data
        dataPoints.unshift({
          date: months[monthIndex],
          // Use real account data to influence the random values for demo
          revenue: Math.floor(Math.random() * 50000) + 30000 + (accounts.length * 1000),
          expenses: Math.floor(Math.random() * 30000) + 15000 + (accounts.length * 500),
        });
      }
      
      res.json({ data: dataPoints });
    } catch (error) {
      console.error('Error fetching revenue/expenses:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch revenue/expenses data' 
      });
    }
  });

  // Chat routes
  app.post('/api/chat/message', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ 
          success: false,
          message: 'Message is required and cannot be empty' 
        });
      }
      
      // Store user message
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      await storage.createChatMessage({
        userId,
        role: 'user',
        content: message
      });
      
      // Gather financial context data for the AI
      let financialContext: any = {};
      
      try {
        // Get accounts and financial data
        const accounts = await fetchAccounts();
        
        if (accounts && accounts.length > 0) {
          const account = accounts[0]; // Use the first account
          const accountId = account._id;
          
          // Fetch transactions for context
          // Get just the first 1000 transactions for better performance
          const transactions = await fetchAccountTransactions(accountId);
          const limitedTransactions = transactions.slice(0, 1000);
          
          // Calculate financial overview
          let revenue = 0;
          let expenses = 0;
          
          limitedTransactions.forEach(transaction => {
            if (transaction.amount > 0) {
              revenue += transaction.amount;
            } else {
              expenses += Math.abs(transaction.amount);
            }
          });
          
          const profit = revenue - expenses;
          const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
          const change = Math.round((Math.random() * 10 - 2) * 10) / 10; // Random change for demo
          
          // Prepare simplified monthly data with fewer data points
          const dataPoints = [
            { date: 'Apr', revenue: 16248.25, expenses: 0 },
            { date: 'May', revenue: 17456.89, expenses: 0 },
            { date: 'Jun', revenue: 15621.35, expenses: 0 },
            { date: 'Jul', revenue: 18965.42, expenses: 0 },
            { date: 'Aug', revenue: 19845.78, expenses: 0 },
            { date: 'Sep', revenue: 20123.55, expenses: 0 }
          ];
          
          // Add data to financial context
          financialContext = {
            revenue,
            expenses,
            profit,
            profitMargin,
            change,
            revenueExpensesData: dataPoints,
            transactions: limitedTransactions.slice(0, 30) // Just use a smaller sample of transactions
          };
        }
      } catch (contextError) {
        console.error('Error gathering financial context:', contextError);
        // Continue without financial context if there's an error
      }
      
      // Get AI response with financial context
      let aiResponse;
      try {
        console.log('Sending message to AI with financial context');
        aiResponse = await generateAIResponse(message, financialContext);
      } catch (aiError) {
        console.error('Error generating AI response:', aiError);
        
        // Store error message as AI response
        const errorMessage = "I'm sorry, I encountered an issue processing your request. Please try again later.";
        await storage.createChatMessage({
          userId,
          role: 'ai',
          content: errorMessage
        });
        
        return res.status(200).json({ 
          text: errorMessage,
          error: (aiError as Error).message
        });
      }
      
      // Store AI response
      await storage.createChatMessage({
        userId,
        role: 'ai',
        content: aiResponse.text
      });
      
      res.json(aiResponse);
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ 
        success: false,
        message: (error as Error).message || 'Failed to process message' 
      });
    }
  });

  app.get('/api/chat/history', async (req, res) => {
    try {
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      const chatHistory = await storage.getChatMessagesByUser(userId);
      res.json(chatHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch chat history' 
      });
    }
  });

  // Insights routes
  app.get('/api/insights', async (req, res) => {
    try {
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      const insights = await storage.getInsightsByUser(userId);
      res.json(insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch insights' 
      });
    }
  });

  app.patch('/api/insights/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markInsightAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking insight as read:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to update insight' 
      });
    }
  });

  // Document generation routes
  app.post('/api/documents/income-statement', async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      // Get accounts and transactions
      const accounts = await fetchAccounts();
      let transactions: NessieTransaction[] = [];
      
      for (const account of accounts) {
        const accountTransactions = await fetchAccountTransactions(account._id);
        transactions = [...transactions, ...accountTransactions];
      }
      
      // Generate income statement using AI
      const statement = await generateFinancialStatement(transactions, startDate, endDate);
      
      // Store document
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      const document = await storage.createDocument({
        userId,
        title: `Income Statement (${startDate} to ${endDate})`,
        documentType: 'income_statement',
        content: statement
      });
      
      res.json(statement);
    } catch (error) {
      console.error('Error generating income statement:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to generate income statement' 
      });
    }
  });

  // Generate audit documents
  app.post('/api/documents/audit', async (req, res) => {
    try {
      const { startDate, endDate, selectedItems } = req.body;
      const documents = [];
      
      // Get accounts and transactions
      const accounts = await fetchAccounts();
      let transactions: NessieTransaction[] = [];
      
      for (const account of accounts) {
        const accountTransactions = await fetchAccountTransactions(account._id);
        transactions = [...transactions, ...accountTransactions];
      }

      // Generate selected documents
      if (selectedItems.incomeStatement) {
        const incomeStatement = await generateFinancialStatement(transactions, startDate, endDate);
        documents.push({
          title: `Income Statement (${startDate} to ${endDate})`,
          documentType: 'income_statement',
          content: incomeStatement
        });
      }

      if (selectedItems.cashFlow) {
        const cashFlow = await generateCashFlow(transactions, startDate, endDate);
        documents.push({
          title: `Cash Flow Statement (${startDate} to ${endDate})`,
          documentType: 'cash_flow',
          content: cashFlow
        });
      }

      // Store documents
      const userId = 1; // In production, get from session
      for (const doc of documents) {
        await storage.createDocument({
          userId,
          ...doc
        });
      }
      
      res.json({ success: true, documents });
    } catch (error) {
      console.error('Error generating audit documents:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to generate audit documents' 
      });
    }
  });

  app.post('/api/documents/cash-flow', async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      // Get accounts and transactions
      const accounts = await fetchAccounts();
      let transactions: NessieTransaction[] = [];
      
      for (const account of accounts) {
        const accountTransactions = await fetchAccountTransactions(account._id);
        transactions = [...transactions, ...accountTransactions];
      }
      
      // Generate cash flow statement using AI
      const statement = await generateCashFlow(transactions, startDate, endDate);
      
      // Store document
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      const document = await storage.createDocument({
        userId,
        title: `Cash Flow Statement (${startDate} to ${endDate})`,
        documentType: 'cash_flow',
        content: statement
      });
      
      res.json(statement);
    } catch (error) {
      console.error('Error generating cash flow statement:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to generate cash flow statement' 
      });
    }
  });

  app.get('/api/documents', async (req, res) => {
    try {
      // In a real app, you'd get the user ID from the session
      const userId = 1; // Placeholder
      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch documents' 
      });
    }
  });

  app.get('/api/documents/:id/pdf', async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(parseInt(id));
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Generate a more detailed document response with actual content
      // Return structured data that can be rendered as PDF on the client side
      if (document.documentType === 'income_statement') {
        // Get the income statement content
        const incomeStatement = document.content as any;
        
        // Return the structured data for the income statement
        res.json({
          documentId: id,
          documentType: document.documentType,
          title: document.title,
          createdAt: document.createdAt,
          data: {
            periodStart: incomeStatement.periodStart,
            periodEnd: incomeStatement.periodEnd,
            revenue: {
              total: incomeStatement.revenue.total,
              categories: incomeStatement.revenue.categories
            },
            expenses: {
              total: incomeStatement.expenses.total,
              categories: incomeStatement.expenses.categories
            },
            profit: incomeStatement.profit,
            profitMargin: incomeStatement.profitMargin
          }
        });
      } else if (document.documentType === 'cash_flow') {
        // Get the cash flow statement content
        const cashFlowStatement = document.content as any;
        
        // Return the structured data for the cash flow statement
        res.json({
          documentId: id,
          documentType: document.documentType,
          title: document.title,
          createdAt: document.createdAt,
          data: {
            periodStart: cashFlowStatement.periodStart,
            periodEnd: cashFlowStatement.periodEnd,
            operatingActivities: cashFlowStatement.operatingActivities,
            investingActivities: cashFlowStatement.investingActivities,
            financingActivities: cashFlowStatement.financingActivities,
            netChange: cashFlowStatement.netChange,
            startingBalance: cashFlowStatement.startingBalance,
            endingBalance: cashFlowStatement.endingBalance
          }
        });
      } else {
        // For any other document types
        res.json({
          documentId: id,
          documentType: document.documentType,
          title: document.title,
          createdAt: document.createdAt,
          content: document.content
        });
      }
    } catch (error) {
      console.error('Error generating document data:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to generate document data' 
      });
    }
  });

  // Loan approval calculator routes
  app.post('/api/loan-calculator/approval', async (req, res) => {
    try {
      const { calculateLoanApproval } = await import('./services/loan-calculator');
      const result = calculateLoanApproval(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error calculating loan approval:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to calculate loan approval' 
      });
    }
  });

  // Get loan type information
  app.get('/api/loan-calculator/types', async (_req, res) => {
    try {
      // Return loan types and basic information
      res.json({
        types: [
          {
            id: 'SBA Loan',
            name: 'SBA Loan',
            description: 'Small Business Administration backed loans with favorable terms',
            pros: ['Low rates', 'Longer repayment terms', 'Higher approval for established businesses'],
            cons: ['Downpayment or collateral required', 'Long application process', 'Extensive documentation'],
            timeToFunding: '30-90 days'
          },
          {
            id: 'Term Loan',
            name: 'Term Loan',
            description: 'Traditional business loan with fixed repayment schedule',
            pros: ['Low rates', 'Fixed payment schedule', 'Build business credit'],
            cons: ['Stricter eligibility requirements', 'May require collateral', 'Less flexible than line of credit'],
            timeToFunding: '2-7 days'
          },
          {
            id: 'Line of Credit',
            name: 'Line of Credit',
            description: 'Flexible revolving credit line that can be used as needed',
            pros: ['Flexible use', 'Only pay interest on what you borrow', 'Revolving credit'],
            cons: ['Account fees', 'Variable interest rates', 'Can lead to debt cycles if mismanaged'],
            timeToFunding: '1-3 days'
          },
          {
            id: 'Revenue-Based Financing',
            name: 'Revenue-Based Financing',
            description: 'Financing based on a percentage of your future revenue',
            pros: ['Easiest approval', 'No fixed payment schedule', 'No collateral required'],
            cons: ['Higher cost of financing', 'Percentage of revenue goes to repayment', 'Less predictable payment schedule'],
            timeToFunding: '1-5 days'
          }
        ],
        industries: [
          'Technology',
          'Healthcare',
          'Food & Beverage',
          'Retail',
          'Manufacturing',
          'Construction',
          'Professional Services',
          'Hospitality',
          'Education',
          'Real Estate',
          'Transportation',
          'Agriculture',
          'Entertainment'
        ]
      });
    } catch (error) {
      console.error('Error fetching loan types:', error);
      res.status(500).json({ 
        message: (error as Error).message || 'Failed to fetch loan types' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
