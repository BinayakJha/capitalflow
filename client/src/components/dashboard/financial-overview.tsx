import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchRevenueExpenses, fetchFinancialOverview } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function FinancialOverview() {
  const [timePeriod, setTimePeriod] = useState('month');
  
  const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['/api/financial/overview', timePeriod],
    queryFn: () => fetchFinancialOverview(timePeriod),
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['/api/financial/revenue-expenses', timePeriod],
    queryFn: () => fetchRevenueExpenses(timePeriod),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="ml-2 text-sm font-medium text-success">
          +{change.toFixed(1)}%
          <svg className="inline-block h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="ml-2 text-sm font-medium text-error">
          {change.toFixed(1)}%
          <svg className="inline-block h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-2 text-sm font-medium text-gray-500">
        0%
      </span>
    );
  };

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 90 days';
      case 'year':
        return 'Year to date';
      case 'custom':
        return 'Last 12 months';
      default:
        return 'Last 30 days';
    }
  };

  // Generate sample data for development
  const getSampleData = () => {
    const data = [];
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (now.getMonth() - i + 12) % 12;
      data.unshift({
        date: months[monthIndex],
        revenue: Math.floor(Math.random() * 50000) + 30000,
        expenses: Math.floor(Math.random() * 30000) + 15000,
      });
    }
    
    return data;
  };

  const sampleData = getSampleData();
  const displayData = chartData?.data || sampleData;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-full sm:w-auto mb-4 sm:mb-0">
              <div className="text-base font-medium text-gray-500">Revenue vs. Expenses</div>
              <div className="mt-1 flex items-baseline justify-between sm:block">
                <div className="flex items-baseline text-2xl font-semibold text-primary">
                  {isOverviewLoading ? (
                    <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <>
                      {formatCurrency(overviewData?.revenue || 82475)}
                      {getChangeIndicator(overviewData?.change || 5.2)}
                    </>
                  )}
                </div>
                <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 sm:mt-2">
                  {getPeriodLabel()}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto flex">
              <div className="relative flex-1 sm:flex-initial">
                <Select 
                  value={timePeriod} 
                  onValueChange={(value) => setTimePeriod(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last 90 days</SelectItem>
                    <SelectItem value="year">Year to date</SelectItem>
                    <SelectItem value="custom">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="h-[220px] mt-6">
            {isChartLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={displayData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
