import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedMetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeDirection?: 'increase' | 'decrease' | 'neutral';
  period?: string;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  animation?: 'fade' | 'bounce' | 'slide' | 'scale' | 'none';
  className?: string;
}

export function AnimatedMetricCard({
  title,
  value,
  change,
  changeDirection = 'neutral',
  period,
  isLoading = false,
  prefix = '',
  suffix = '',
  animation = 'fade',
  className = '',
}: AnimatedMetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Convert value to number for animation
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Delay to allow for proper mounting animation
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isVisible && typeof numericValue === 'number' && !isNaN(numericValue)) {
      // Animate counting up
      const duration = 1500; // ms
      const steps = 30;
      const stepTime = duration / steps;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        // Easing function for smoother animation
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        setAnimatedValue(numericValue * easedProgress);
        
        if (step >= steps) {
          clearInterval(interval);
          setAnimatedValue(numericValue);
        }
      }, stepTime);
      
      return () => clearInterval(interval);
    }
  }, [numericValue, isVisible]);
  
  // Format animated value
  const formattedValue = 
    typeof value === 'string' && isNaN(parseFloat(value)) 
      ? value // If not a number, just display the string
      : `${prefix}${Math.floor(animatedValue).toLocaleString()}${suffix}`;
  
  // Determine animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: animation === 'slide' ? 30 : 0,
      scale: animation === 'scale' ? 0.8 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96], // Custom cubic bezier for smooth motion
      }
    }
  };
  
  // Bounce animation for the value
  const valueVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: animation === 'bounce' ? 'spring' : 'tween',
        stiffness: 400,
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  // Change indicator animation
  const changeVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.4, duration: 0.4 }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={cardVariants}
      className={`w-full ${className}`}
    >
      <Card className="overflow-hidden border bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors duration-300">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-10 bg-muted/40 rounded animate-pulse w-24"
              />
            ) : (
              <motion.div
                key="content"
                variants={valueVariants}
                className="flex items-end gap-2"
              >
                <span className="text-3xl font-bold tracking-tight">
                  {formattedValue}
                </span>
                
                {change && (
                  <motion.div
                    variants={changeVariants}
                    className={`mb-1 flex items-center text-xs font-medium ${
                      changeDirection === 'increase' 
                        ? 'text-green-500' 
                        : changeDirection === 'decrease' 
                          ? 'text-red-500' 
                          : 'text-muted-foreground'
                    }`}
                  >
                    {changeDirection === 'increase' && (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                    {changeDirection === 'decrease' && (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    )}
                    {change}%
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {period && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6 }}
              className="mt-1 text-xs text-muted-foreground"
            >
              {period}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}