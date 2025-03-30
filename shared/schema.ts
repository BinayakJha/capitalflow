import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  firebaseId: text("firebase_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial accounts linked to a user
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountId: text("account_id").notNull(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(),
  balance: integer("balance").notNull(),
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
});

// Transactions linked to accounts
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  transactionId: text("transaction_id").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  category: text("category"),
  date: timestamp("date").notNull(),
  merchantName: text("merchant_name"),
  isIncome: boolean("is_income").default(false),
});

// AI generated insights for users
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Chat messages between user and AI
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated financial documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), // 'income_statement', 'cash_flow', etc.
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  firebaseId: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
