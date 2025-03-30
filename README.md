# 💸 CapitalFlow – *Where Small Business Meets Big Clarity*

**CapitalFlow** is an AI-powered financial management platform designed to empower small business owners with the tools they need to understand, improve, and present their finances with confidence.

In a world where **70% of small business loan applications** are rejected due to incomplete or unclear financials, CapitalFlow steps in as a smart financial co-pilot — helping users not only organize their data, but leverage it to access capital.

---

## 🔍 Why CapitalFlow?

> 💼 **33.2 million** small businesses operate in the U.S.  
> 📉 **82%** of business failures are due to poor cash flow management  
> 📊 **42%** of owners lack basic financial literacy  
> *(Sources: SBA, SCORE, QuickBooks)*

Most small business owners aren’t accountants — and they shouldn’t have to be. CapitalFlow uses **natural language AI** and **real-time transaction data** to help users:

- Understand where their money is going  
- Instantly generate clean financial documents  
- Simulate loan readiness  
- Receive personalized, actionable insights

No jargon. No spreadsheets. Just clarity.

---

## 🚀 Core Features

| Feature | Description |
|--------|-------------|
| ✨ **AI Chat Assistant** | Ask anything — "What was my profit last quarter?" — and get instant insights |
| 📄 **PDF Statement Generator** | Auto-generate income and cash flow statements with one click |
| 📊 **Loan Readiness Engine** | See your pre-approval chances based on real financial data |
| 🔗 **Banking API Integration** | Pull live data using Capital One’s Nessie API |
| 🔐 **Google Sign-In (Firebase)** | Fast, secure login to protect your business data |
| 📈 **Dynamic Financial Dashboard** | Visualize earnings, expenses, and cash flow trends at a glance |

---

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




