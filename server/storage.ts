import { 
  User, InsertUser, ChatMessage, InsertChatMessage, 
  Insight, InsertInsight, Document, InsertDocument,
  Account, InsertAccount, Transaction, InsertTransaction 
} from "@shared/schema";

// Storage interface for all data operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account operations
  getAccount(id: number): Promise<Account | undefined>;
  getAccountsByUser(userId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Chat operations
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Insight operations
  getInsight(id: number): Promise<Insight | undefined>;
  getInsightsByUser(userId: number): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  markInsightAsRead(id: number): Promise<void>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private chatMessages: Map<number, ChatMessage>;
  private insights: Map<number, Insight>;
  private documents: Map<number, Document>;
  
  private currentUserId: number;
  private currentAccountId: number;
  private currentTransactionId: number;
  private currentChatMessageId: number;
  private currentInsightId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.chatMessages = new Map();
    this.insights = new Map();
    this.documents = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentChatMessageId = 1;
    this.currentInsightId = 1;
    this.currentDocumentId = 1;
    
    // Add sample insights for UI development
    this.seedInsights();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Account operations
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async getAccountsByUser(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId,
    );
  }
  
  async createAccount(account: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const newAccount: Account = { ...account, id };
    this.accounts.set(id, newAccount);
    return newAccount;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.accountId === accountId,
    );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  // Chat operations
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }
  
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const createdAt = new Date();
    const newMessage: ChatMessage = { ...message, id, createdAt };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }
  
  // Insight operations
  async getInsight(id: number): Promise<Insight | undefined> {
    return this.insights.get(id);
  }
  
  async getInsightsByUser(userId: number): Promise<Insight[]> {
    return Array.from(this.insights.values())
      .filter((insight) => insight.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const id = this.currentInsightId++;
    const createdAt = new Date();
    const isRead = false;
    const newInsight: Insight = { ...insight, id, createdAt, isRead };
    this.insights.set(id, newInsight);
    return newInsight;
  }
  
  async markInsightAsRead(id: number): Promise<void> {
    const insight = this.insights.get(id);
    if (insight) {
      insight.isRead = true;
      this.insights.set(id, insight);
    }
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter((document) => document.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const createdAt = new Date();
    const newDocument: Document = { ...document, id, createdAt };
    this.documents.set(id, newDocument);
    return newDocument;
  }
  
  // Seed data for development
  private seedInsights() {
    const sampleInsights = [
      {
        userId: 1,
        content: "Your Q3 revenue is on track to exceed Q2 by 12% if current growth continues",
        category: "Revenue Analysis",
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        userId: 1,
        content: "You've reduced operational expenses by 7.5% compared to last quarter",
        category: "Cost Optimization",
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: 1,
        content: "Three invoices totaling $5,429 are overdue by more than 30 days",
        category: "Cash Flow Alert",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: 1,
        content: "Consider setting aside funds for Q4 estimated tax payments due January 15",
        category: "Tax Planning",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: 1,
        content: "Based on your cash reserves, you could increase your investment in equipment by 15%",
        category: "Investment",
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];
    
    for (const insight of sampleInsights) {
      const id = this.currentInsightId++;
      const newInsight: Insight = { ...insight, id };
      this.insights.set(id, newInsight);
    }
  }
}

export const storage = new MemStorage();
