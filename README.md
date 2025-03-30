# CapitalFlow 💸

**CapitalFlow** is an AI-powered financial management platform built for small business owners. The app helps users analyze their financial health, generate pre-approval documents, and improve their chances of getting business loans with personalized insights and smart automation.

## 🔍 Overview

In today's complex financial landscape, many small business owners struggle to prepare documents for loan applications and understand what lenders are looking for. CapitalFlow bridges that gap using cutting-edge AI to:

- Provide loan readiness assessments  
- Generate financial documents (Income Statement, Cash Flow)  
- Offer personalized suggestions to improve financial standing  
- Track real-time account and transaction data  

## 🚀 Features

- ✨ **AI-powered Chat** — Get insights and suggestions tailored to your business  
- 📄 **PDF Document Generator** — Instantly create income & cash flow statements  
- 📊 **Loan Readiness Scoring Engine** — Simulates pre-approval chances  
- 🔗 **Capital One Nessie API Integration** — Real-time transaction tracking  
- 🔐 **Google Sign-In with Firebase** — Seamless and secure authentication  
- 📈 **Dynamic Dashboards** — Visual breakdowns of your finances  

## 🧠 Tech Stack

- **Frontend**: React.js + Shadcn UI + Tailwind CSS + React Router  
- **Backend**: Express.js (Node.js), In-memory storage  
- **Authentication**: Firebase  
- **AI Integration**: Claude by Anthropic  
- **Banking Data**: Capital One Nessie API  
- **PDF Generation**: html2pdf  
- **Deployment**: Vercel (Frontend) + Render (Backend)  

## 📦 Directory Structure

```
capitalflow/
├── client/                # Frontend (React)
├── server/                # Backend (Express)
├── shared/                # Shared utilities/types
├── attached_assets/       # Assets used in presentation or docs
├── drizzle.config.ts      # Drizzle ORM configuration (optional)
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite bundler config
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project metadata and dependencies
```



## 🛠️ Setup & Installation

Clone the repo and get started locally:

```bash
git clone https://github.com/BinayakJha/excelerate.git
cd excelerate

# Install dependencies
npm install

# Run the development server
npm run dev




