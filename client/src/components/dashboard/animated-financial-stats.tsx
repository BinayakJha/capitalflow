import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchFinancialOverview } from '@/lib/api';
import { AnimatedMetricCard } from './animated-metric-card';

// Define the financial overview response type
interface FinancialOverviewResponse {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  change?: number;
}

export function AnimatedFinancialStats() {
  const [staggerDelay, setStaggerDelay] = useState(0.1);
  
  // On small screens, don't stagger the animations (all cards appear simultaneously)
  useEffect(() => {
    const handleResize = () => {
      setStaggerDelay(window.innerWidth < 768 ? 0 : 0.1);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const { data, isLoading } = useQuery<FinancialOverviewResponse>({
    queryKey: ['/api/financial/overview'],
    queryFn: () => fetchFinancialOverview(),
  });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      }
    }
  };
  
  // Calculate the change directions based on the change value
  const revenueChangeDirection = data?.change !== undefined && data.change >= 0 ? 'increase' : 'decrease';
  const profitChangeDirection = data?.change !== undefined && data.change >= 0 ? 'increase' : 'decrease';
  const marginChangeDirection = data?.change !== undefined && data.change >= 0 ? 'increase' : 'decrease';
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <AnimatedMetricCard
        title="Revenue"
        value={data?.revenue || 0}
        change={data?.change || 0}
        changeDirection={revenueChangeDirection}
        period="Last 30 days"
        isLoading={isLoading}
        prefix="$"
        animation="bounce"
      />
      
      <AnimatedMetricCard
        title="Expenses"
        value={data?.expenses || 0}
        change={3.5}
        changeDirection="increase"
        period="Last 30 days"
        isLoading={isLoading}
        prefix="$"
        animation="slide"
      />
      
      <AnimatedMetricCard
        title="Net Profit"
        value={data?.profit || 0}
        change={data?.change !== undefined ? data.change * 1.2 : 0}
        changeDirection={profitChangeDirection}
        period="Last 30 days"
        isLoading={isLoading}
        prefix="$"
        animation="scale"
      />
      
      <AnimatedMetricCard
        title="Profit Margin"
        value={data?.profitMargin !== undefined ? data.profitMargin.toFixed(1) : '0'}
        change={data?.change !== undefined ? Math.abs(data.change) * 0.8 : 0}
        changeDirection={marginChangeDirection}
        period="Last 30 days"
        isLoading={isLoading}
        suffix="%"
        animation="fade"
      />
    </motion.div>
  );
}