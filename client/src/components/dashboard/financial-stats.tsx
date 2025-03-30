import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchFinancialOverview } from '@/lib/api';

interface FinancialStatProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
  period: string;
  iconBgClass: string;
  iconTextClass: string;
}

function FinancialStat({ 
  title, 
  value, 
  icon, 
  change, 
  period, 
  iconBgClass, 
  iconTextClass 
}: FinancialStatProps) {
  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string' && value.endsWith('%')) {
      return value;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const changeText = change >= 0 
    ? `${change.toFixed(1)}% from last ${period}` 
    : `${Math.abs(change).toFixed(1)}% from last ${period}`;
  
  const changeIcon = change >= 0 
    ? (
      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) 
    : (
      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  
  const changeColor = change >= 0 ? 'text-success' : 'text-error';

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgClass} rounded-md p-3`}>
            <div className={iconTextClass}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {typeof value === 'string' && value.endsWith('%') ? value : formatCurrency(value)}
                </div>
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${changeColor} flex items-center`}>
              {changeIcon}
              {changeText}
            </div>
            <div className="text-sm text-gray-500">July 2023</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialStats() {
  const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['/api/financial/overview', 'month'],
    queryFn: () => fetchFinancialOverview('month'),
  });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      <FinancialStat
        title="Monthly Revenue"
        value={isMonthlyLoading ? 0 : (monthlyData?.revenue || 12346)}
        icon={
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        change={8.2}
        period="month"
        iconBgClass="bg-primary-100"
        iconTextClass="text-primary-600"
      />

      <FinancialStat
        title="Monthly Expenses"
        value={isMonthlyLoading ? 0 : (monthlyData?.expenses || 8795)}
        icon={
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        change={-3.5}
        period="month"
        iconBgClass="bg-red-100"
        iconTextClass="text-red-600"
      />

      <FinancialStat
        title="Profit Margin"
        value={isMonthlyLoading ? "0%" : `${(monthlyData?.profitMargin || 28.7).toFixed(1)}%`}
        icon={
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        change={2.1}
        period="month"
        iconBgClass="bg-green-100"
        iconTextClass="text-green-600"
      />
    </div>
  );
}
