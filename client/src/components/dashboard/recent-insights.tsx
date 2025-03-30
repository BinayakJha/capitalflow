import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchInsights, markInsightAsRead } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

interface InsightBadgeProps {
  category: string;
}

function InsightBadge({ category }: InsightBadgeProps) {
  const categoryMap: Record<string, { bg: string; text: string }> = {
    'Revenue Analysis': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Cost Optimization': { bg: 'bg-green-100', text: 'text-green-800' },
    'Cash Flow Alert': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Tax Planning': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'Investment': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  };

  const { bg, text } = categoryMap[category] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {category}
    </span>
  );
}

function formatTimeAgo(date: Date | string | undefined) {
  if (!date) {
    return 'recently';
  }
  
  // Convert string date to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  return dateObj.toLocaleDateString();
}

export function RecentInsights() {
  const [showAll, setShowAll] = useState(false);
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/insights'],
    queryFn: fetchInsights,
  });

  const handleMarkAsRead = async (insightId: number) => {
    await markInsightAsRead(insightId);
    queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
  };

  // Placeholder insights for development
  const placeholderInsights = [
    {
      id: 1,
      content: "Your Q3 revenue is on track to exceed Q2 by 12% if current growth continues",
      category: "Revenue Analysis",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isRead: false,
    },
    {
      id: 2,
      content: "You've reduced operational expenses by 7.5% compared to last quarter",
      category: "Cost Optimization",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
    },
    {
      id: 3,
      content: "Three invoices totaling $5,429 are overdue by more than 30 days",
      category: "Cash Flow Alert",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: false,
    },
    {
      id: 4,
      content: "Consider setting aside funds for Q4 estimated tax payments due January 15",
      category: "Tax Planning",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
    },
    {
      id: 5,
      content: "Based on your cash reserves, you could increase your investment in equipment by 15%",
      category: "Investment",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      isRead: false,
    },
  ];

  const displayInsights = insights || placeholderInsights;
  const visibleInsights = showAll ? displayInsights : displayInsights.slice(0, 3);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent AI Insights</h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-1">
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ))
            ) : (
              visibleInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`border-l-4 ${
                    insight.category === 'Revenue Analysis' 
                      ? 'border-primary-500' 
                      : insight.category === 'Cost Optimization' 
                        ? 'border-success' 
                        : 'border-warning'
                  } pl-4 py-2`}
                >
                  <div className="flex justify-between">
                    <p className={`text-gray-800 text-sm font-medium ${insight.isRead ? 'opacity-70' : ''}`}>
                      {insight.content}
                    </p>
                    <span className="text-gray-400 text-xs">
                      {formatTimeAgo(insight.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <InsightBadge category={insight.category} />
                    {!insight.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(insight.id)}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-6 py-3 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : 'View all insights'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
