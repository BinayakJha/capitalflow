import axios from 'axios';
import { NessieTransaction, RevenueExpenseData } from '@shared/types';
import { Anthropic } from '@anthropic-ai/sdk';

// Type definitions for financial data
interface MonthData {
  date: string;
  revenue: number;
  expenses: number;
}

// API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
console.log('Initializing Anthropic client with API key available:', !!CLAUDE_API_KEY);
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY || '', // Provide empty string as fallback to avoid undefined
});

// API URLs
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Check if ANTHROPIC_API_KEY is available
if (!CLAUDE_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY is not set. Claude AI functionality will be limited.');
}

// Generate AI response to a user question with financial context
export async function generateAIResponse(
  message: string, 
  financialContext: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    profitMargin?: number;
    change?: number;
    revenueExpensesData?: Array<{date: string; revenue: number; expenses: number}>;
    transactions?: NessieTransaction[];
  } = {}
) {
  try {
    // Check if we have both API keys available for dual-model approach
    if (CLAUDE_API_KEY && GEMINI_API_KEY) {
      // If the query appears to be analytics-focused, use Gemini
      const analyticsKeywords = [
        'analyze', 'trend', 'compare', 'metrics', 'statistics', 
        'growth', 'pattern', 'predict', 'forecast', 'projection',
        'historical', 'correlation', 'performance', 'revenue', 'expenses',
        'profit', 'margin', 'cash flow', 'roi', 'kpi'
      ];
      
      const isAnalyticsQuery = analyticsKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      if (isAnalyticsQuery) {
        const geminiResponse = await generateGeminiAnalytics(message, financialContext);
        
        // Get additional advice from Claude
        const claudeAdvice = await generateClaudeAdvice(message, geminiResponse.text, financialContext);
        
        // Return combined response
        return { 
          text: `${geminiResponse.text}\n\n**Financial Advice:**\n${claudeAdvice.text}`,
          analysis: geminiResponse.text,
          advice: claudeAdvice.text
        };
      } else {
        // For general questions, use Claude as primary
        return await generateClaudeResponse(message, financialContext);
      }
    } 
    // Fallback to single model if only one is available
    else if (CLAUDE_API_KEY) {
      return await generateClaudeResponse(message, financialContext);
    } else if (GEMINI_API_KEY) {
      return await generateGeminiResponse(message, financialContext);
    } else {
      // If no API keys are configured, return a helpful message
      return { 
        text: "I'm unable to process your request at the moment. Please contact your administrator to configure AI service API keys." 
      };
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Try fallback if primary method fails
    try {
      if (CLAUDE_API_KEY && String(error).includes('Gemini')) {
        console.log('Falling back to Claude API');
        return await generateClaudeResponse(message, financialContext);
      } else if (GEMINI_API_KEY) {
        console.log('Falling back to Gemini API');
        return await generateGeminiResponse(message, financialContext);
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    // Provide a more user-friendly error message
    return { 
      text: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if this issue persists." 
    };
  }
}

// Generate response using Google's Gemini API
async function generateGeminiResponse(
  message: string,
  financialContext: any = {}
) {
  try {
    // Prepare financial context as a readable string
    let contextString = '';
    if (Object.keys(financialContext).length > 0) {
      contextString = `Here is the relevant financial data for this business:\n`;
      
      if (financialContext.revenue !== undefined) {
        contextString += `- Revenue: $${financialContext.revenue.toLocaleString()}\n`;
      }
      
      if (financialContext.expenses !== undefined) {
        contextString += `- Expenses: $${financialContext.expenses.toLocaleString()}\n`;
      }
      
      if (financialContext.profit !== undefined) {
        contextString += `- Profit: $${financialContext.profit.toLocaleString()}\n`;
      }
      
      if (financialContext.profitMargin !== undefined) {
        contextString += `- Profit Margin: ${financialContext.profitMargin.toFixed(2)}%\n`;
      }
      
      if (financialContext.change !== undefined) {
        const changeDirection = financialContext.change >= 0 ? 'increase' : 'decrease';
        contextString += `- Recent Change: ${Math.abs(financialContext.change).toFixed(1)}% ${changeDirection}\n`;
      }
      
      if (financialContext.revenueExpensesData?.length > 0) {
        contextString += `- Monthly Data (most recent 6 months):\n`;
        const recentMonths = financialContext.revenueExpensesData.slice(-6);
        
        recentMonths.forEach(month => {
          contextString += `  * ${month.date}: Revenue $${month.revenue.toLocaleString()}, Expenses $${month.expenses.toLocaleString()}\n`;
        });
      }
    }

    const fullPrompt = contextString ? 
      `${contextString}\n\nBased on this financial data, please ${message}` : 
      message;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are a data-driven financial analyst for CapitalFlow, focusing on analyzing business finances. Provide brief, concise insights.

When responding:
1. Keep responses under 200 words total
2. Use bullet points for key metrics 
3. Focus on the most important 2-3 insights only
4. Be direct and concise
5. Format with bold headers and numbered lists

Here is the user question: ${fullPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more analytical responses
          maxOutputTokens: 350, // Reduced token limit for faster responses
          topK: 1,
          topP: 0.8
        }
      }
    );

    // Extract text from response
    const text = response.data.candidates[0].content.parts[0].text;
    return { text };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}

// Specialized Gemini function for data analytics
async function generateGeminiAnalytics(
  message: string,
  financialContext: any = {}
) {
  try {
    // Prepare financial context as a readable string
    let contextString = '';
    if (Object.keys(financialContext).length > 0) {
      contextString = `Here is the relevant financial data for this business:\n`;
      
      if (financialContext.revenue !== undefined) {
        contextString += `- Revenue: $${financialContext.revenue.toLocaleString()}\n`;
      }
      
      if (financialContext.expenses !== undefined) {
        contextString += `- Expenses: $${financialContext.expenses.toLocaleString()}\n`;
      }
      
      if (financialContext.profit !== undefined) {
        contextString += `- Profit: $${financialContext.profit.toLocaleString()}\n`;
      }
      
      if (financialContext.profitMargin !== undefined) {
        contextString += `- Profit Margin: ${financialContext.profitMargin.toFixed(2)}%\n`;
      }
      
      if (financialContext.change !== undefined) {
        const changeDirection = financialContext.change >= 0 ? 'increase' : 'decrease';
        contextString += `- Recent Change: ${Math.abs(financialContext.change).toFixed(1)}% ${changeDirection}\n`;
      }
      
      if (financialContext.revenueExpensesData?.length > 0) {
        contextString += `- Monthly Data (most recent months):\n`;
        const recentMonths = financialContext.revenueExpensesData;
        
        recentMonths.forEach(month => {
          contextString += `  * ${month.date}: Revenue $${month.revenue.toLocaleString()}, Expenses $${month.expenses.toLocaleString()}\n`;
        });
      }
      
      if (financialContext.transactions?.length > 0) {
        const sampleSize = Math.min(10, financialContext.transactions.length);
        contextString += `- Sample of recent transactions (${sampleSize} of ${financialContext.transactions.length}):\n`;
        
        for (let i = 0; i < sampleSize; i++) {
          const t = financialContext.transactions[i];
          contextString += `  * ${t.transaction_date}: ${t.description} - $${Math.abs(t.amount).toLocaleString()} (${t.amount > 0 ? 'Income' : 'Expense'})\n`;
        }
      }
    }

    const fullPrompt = contextString ? 
      `${contextString}\n\nBased on this financial data, please ${message}` : 
      message;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are a data-driven financial analyst for CapitalFlow, focusing on business financial analysis. Provide brief, concise insights.

When responding:
1. Keep responses under 200 words total
2. Use bullet points for key metrics 
3. Focus on the most important 2-3 insights only
4. Be direct and concise
5. Format with bold headers and numbered lists

Here is the user question about their financial data: ${fullPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
          maxOutputTokens: 350, // Reduced token limit for faster responses
          topK: 1,
          topP: 0.8
        }
      }
    );

    // Extract text from response
    const text = response.data.candidates[0].content.parts[0].text;
    return { text };
  } catch (error) {
    console.error('Error generating Gemini analytics:', error);
    throw error;
  }
}

// Generate advice using Claude
async function generateClaudeAdvice(
  originalMessage: string,
  geminiAnalysis: string,
  financialContext: any = {}
) {
  try {
    console.log('Generating Claude advice with API key available:', !!CLAUDE_API_KEY);
    
    // Prepare financial context as a readable string
    let contextString = '';
    if (Object.keys(financialContext).length > 0) {
      contextString = `Here is the relevant financial data for this business:\n`;
      
      if (financialContext.revenue !== undefined) {
        contextString += `- Revenue: $${financialContext.revenue.toLocaleString()}\n`;
      }
      
      if (financialContext.expenses !== undefined) {
        contextString += `- Expenses: $${financialContext.expenses.toLocaleString()}\n`;
      }
      
      if (financialContext.profit !== undefined) {
        contextString += `- Profit: $${financialContext.profit.toLocaleString()}\n`;
      }
      
      if (financialContext.profitMargin !== undefined) {
        contextString += `- Profit Margin: ${financialContext.profitMargin.toFixed(2)}%\n`;
      }
    }
    
    // System prompt for Claude
    const systemPrompt = `You are the financial advice specialist for CapitalFlow, an AI-powered financial platform for small businesses. Your role is strictly to provide strategic financial advice and actionable suggestions, not data analysis.

Your strengths are:
1. Providing practical, actionable financial advice that small business owners can implement
2. Suggesting specific strategies to improve financial performance
3. Offering clear next steps based on financial analysis
4. Maintaining a supportive, encouraging tone while being direct about financial realities
5. Focusing on solutions, not just problems

Today, you're working alongside Gemini, the analytics specialist who has already provided data analysis to the user. Your job is ONLY to provide advice based on that analysis, not to repeat the analysis itself.`;

    // Message to Claude
    const messageToAI = `User question: "${originalMessage}"

Financial context: ${contextString}

Gemini's data analysis: ${geminiAnalysis}

Based on the above analysis, provide 3-4 concise, actionable pieces of financial advice or strategic recommendations. Focus only on advice and next steps, not repeating the analysis. Keep your response under 200 words and use bullet points.`;
    
    console.log('About to call Claude API for advice');
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 400,
      temperature: 0.7,
      stream: false,
      system: systemPrompt,
      messages: [
        { role: 'user', content: messageToAI }
      ],
    });

    // Extract text from response
    if (response && response.content && Array.isArray(response.content) && response.content.length > 0) {
      const content = response.content[0];
      if (content && content.type === 'text' && typeof content.text === 'string') {
        return { text: content.text };
      }
    }
    
    return { text: "I couldn't generate tailored advice at this time." };
  } catch (error) {
    console.error('Error generating Claude advice:', error);
    return { text: "I couldn't generate financial advice at this time due to a technical issue." };
  }
}

// Generate response using Anthropic's Claude API with SDK
async function generateClaudeResponse(
  message: string, 
  financialContext: any = {}
) {
  try {
    console.log('Generating Claude response with API key available:', !!CLAUDE_API_KEY);
    console.log('Message:', message);
    
    // Prepare financial context as a readable string
    let contextString = '';
    if (Object.keys(financialContext).length > 0) {
      contextString = `Here is the relevant financial data for this business:\n`;
      
      if (financialContext.revenue !== undefined) {
        contextString += `- Revenue: $${financialContext.revenue.toLocaleString()}\n`;
      }
      
      if (financialContext.expenses !== undefined) {
        contextString += `- Expenses: $${financialContext.expenses.toLocaleString()}\n`;
      }
      
      if (financialContext.profit !== undefined) {
        contextString += `- Profit: $${financialContext.profit.toLocaleString()}\n`;
      }
      
      if (financialContext.profitMargin !== undefined) {
        contextString += `- Profit Margin: ${financialContext.profitMargin.toFixed(2)}%\n`;
      }
      
      if (financialContext.change !== undefined) {
        const changeDirection = financialContext.change >= 0 ? 'increase' : 'decrease';
        contextString += `- Recent Change: ${Math.abs(financialContext.change).toFixed(1)}% ${changeDirection}\n`;
      }
      
      if (financialContext.revenueExpensesData?.length > 0) {
        contextString += `- Monthly Data (most recent 6 months):\n`;
        const recentMonths = financialContext.revenueExpensesData.slice(-6);
        
        recentMonths.forEach(month => {
          contextString += `  * ${month.date}: Revenue $${month.revenue.toLocaleString()}, Expenses $${month.expenses.toLocaleString()}\n`;
        });
      }
    }
    
    const fullPrompt = contextString ? 
      `${contextString}\n\nBased on this financial data, please respond to my question: ${message}` : 
      message;
    
    // Use Claude 3.7 Sonnet model with the Anthropic SDK
    const systemPrompt = `You are CapitalFlow, an expert financial assistant for small businesses. Your role is to:
1. Provide professional, concise answers about business finance topics
2. Analyze financial data and trends when asked
3. Explain financial concepts in clear, accessible language
4. Offer practical suggestions for improving business finances
5. Help with financial planning, cash flow management, and investment decisions

Always maintain a professional tone while being helpful and approachable. Focus on providing actionable insights that business owners can implement. If asked questions outside the scope of business finance, politely redirect to financial topics.`;
    
    console.log('About to call Claude API');
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 350,
      temperature: 0.5,
      stream: false,
      system: systemPrompt,
      messages: [
        { role: 'user', content: fullPrompt }
      ],
    });

    // Extract text from response (using correct SDK response format)
    if (response && response.content && Array.isArray(response.content) && response.content.length > 0) {
      const content = response.content[0];
      if (content && content.type === 'text' && typeof content.text === 'string') {
        return { text: content.text };
      }
    }
    
    // If we don't find the expected structure, log the response for debugging
    console.log('Unexpected Claude API response structure:', JSON.stringify(response, null, 2));
    
    // Return a fallback response
    return { 
      text: "I encountered an issue processing your request. The API response didn't match the expected format." 
    };
  } catch (error: any) {
    console.error('Error generating Claude response:', error.message || error);
    
    // Return a user-friendly error message
    return { 
      text: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if this issue persists." 
    };
  }
}

// Generate income statement
export async function generateFinancialStatement(
  transactions: NessieTransaction[],
  startDate: string,
  endDate: string
) {
  try {
    // Process transactions to calculate revenue, expenses, and categories
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter transactions within date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= start && transactionDate <= end;
    });
    
    // Categorize and sum transactions
    const revenue = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Create category breakdowns
    const categories = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      // Use description as category (in real app would have proper categorization)
      const category = transaction.description || 'Uncategorized';
      const amount = Math.abs(transaction.amount);
      
      if (transaction.amount > 0) {
        // Revenue
        categories.set(`Revenue: ${category}`, (categories.get(`Revenue: ${category}`) || 0) + amount);
      } else {
        // Expense
        categories.set(`Expense: ${category}`, (categories.get(`Expense: ${category}`) || 0) + amount);
      }
    });
    
    // Create category breakdowns
    const revenueCategories: Array<{category: string, amount: number, percentage: number}> = [];
    const expenseCategories: Array<{category: string, amount: number, percentage: number}> = [];
    
    categories.forEach((amount, category) => {
      if (category.startsWith('Revenue:')) {
        revenueCategories.push({
          category: category.replace('Revenue: ', ''),
          amount,
          percentage: revenue > 0 ? (amount / revenue) * 100 : 0
        });
      } else {
        expenseCategories.push({
          category: category.replace('Expense: ', ''),
          amount,
          percentage: expenses > 0 ? (amount / expenses) * 100 : 0
        });
      }
    });
    
    // Calculate profit and profit margin
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Construct income statement
    return {
      periodStart: startDate,
      periodEnd: endDate,
      revenue: {
        total: revenue,
        categories: revenueCategories
      },
      expenses: {
        total: expenses,
        categories: expenseCategories
      },
      profit,
      profitMargin
    };
  } catch (error) {
    console.error('Error generating income statement:', error);
    throw new Error('Failed to generate income statement');
  }
}

// Generate cash flow statement
export async function generateCashFlow(
  transactions: NessieTransaction[],
  startDate: string,
  endDate: string
) {
  try {
    // Process transactions
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter transactions within date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= start && transactionDate <= end;
    });
    
    // Categorize transactions into cash flow categories
    const operatingIncome = filteredTransactions
      .filter(t => t.amount > 0 && t.type !== 'transfer' && !t.description?.includes('Equipment') && !t.description?.includes('Loan'))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const operatingExpenses = filteredTransactions
      .filter(t => t.amount < 0 && t.type !== 'transfer' && !t.description?.includes('Equipment') && !t.description?.includes('Loan'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const investingActivities = filteredTransactions
      .filter(t => t.description?.includes('Equipment'))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const financingActivities = filteredTransactions
      .filter(t => t.description?.includes('Loan'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate net cash changes
    const netOperatingCash = operatingIncome - operatingExpenses;
    const netChange = netOperatingCash + investingActivities + financingActivities;
    
    // Approximate starting and ending balances (in real app would get from account data)
    const startingBalance = 50000;
    const endingBalance = startingBalance + netChange;
    
    // Construct cash flow statement
    return {
      periodStart: startDate,
      periodEnd: endDate,
      operatingActivities: {
        netIncome: operatingIncome - operatingExpenses,
        adjustments: [
          {
            description: 'Depreciation and Amortization',
            amount: 0 // Would calculate in real app
          },
          {
            description: 'Changes in Working Capital',
            amount: 0 // Would calculate in real app
          }
        ],
        netCash: netOperatingCash
      },
      investingActivities: {
        items: [
          {
            description: 'Equipment Purchases',
            amount: investingActivities < 0 ? investingActivities : 0
          },
          {
            description: 'Equipment Sales',
            amount: investingActivities > 0 ? investingActivities : 0
          }
        ],
        netCash: investingActivities
      },
      financingActivities: {
        items: [
          {
            description: 'Loan Proceeds',
            amount: financingActivities > 0 ? financingActivities : 0
          },
          {
            description: 'Loan Repayments',
            amount: financingActivities < 0 ? financingActivities : 0
          }
        ],
        netCash: financingActivities
      },
      netChange,
      startingBalance,
      endingBalance
    };
  } catch (error) {
    console.error('Error generating cash flow statement:', error);
    throw new Error('Failed to generate cash flow statement');
  }
}
