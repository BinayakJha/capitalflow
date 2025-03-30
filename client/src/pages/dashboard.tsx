import { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { ActionCard } from '@/components/dashboard/action-card';
import { FinancialOverview } from '@/components/dashboard/financial-overview';
import { AnimatedFinancialStats } from '@/components/dashboard/animated-financial-stats';
import { RecentInsights } from '@/components/dashboard/recent-insights';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { isChatOpen, toggleChat } = useChat();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to allow the dashboard to render first
    const timeoutId = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard
              <div className="ml-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </h1>
          </motion.div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              {/* Financial Stats Grid */}
              <div className="mb-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-semibold text-gray-800 mb-4"
                >
                  Financial Summary
                </motion.h2>
                <AnimatedFinancialStats />
              </div>
              
              {/* Quick Actions */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                className="mb-8"
              >
                <motion.h2 
                  variants={itemVariants}
                  className="text-xl font-semibold text-gray-800 mb-4"
                >
                  Quick Actions
                </motion.h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <motion.div variants={itemVariants}>
                    <ActionCard
                      title="Income Statement"
                      description="Generate or view your latest statements"
                      icon={
                        <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      }
                      link="/documents/income-statement"
                      linkText="Generate new"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <ActionCard
                      title="Cash Flow"
                      description="Analyze your business's cash movement"
                      icon={
                        <svg className="h-6 w-6 text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      }
                      link="/documents/cash-flow"
                      linkText="View details"
                      iconBgClass="bg-success-100"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <ActionCard
                      title="Audit Preparation"
                      description="Start pre-audit process"
                      icon={
                        <svg className="h-6 w-6 text-warning" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      }
                      link="/documents/audit-prep"
                      linkText="Get started"
                      iconBgClass="bg-warning-100"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <ActionCard
                      title="Ask AI Assistant"
                      description="Get quick answers about your finances"
                      icon={
                        <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      }
                      link="#"
                      linkText="Ask a question"
                      onLinkClick={toggleChat}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Financial Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.8,
                  type: 'spring',
                  damping: 20
                }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Overview</h2>
                <FinancialOverview />
              </motion.div>

              {/* Recent AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.6, 
                  duration: 0.8,
                  type: 'spring',
                  damping: 20
                }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent AI Insights</h2>
                <RecentInsights />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
