import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PdfGenerator } from '@/components/documents/pdf-generator';
import { useChat } from '@/context/chat-context';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useQuery } from '@tanstack/react-query';
import { generatePDF } from '@/lib/api';
import type { Document } from '@shared/schema';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { isChatOpen, toggleChat } = useChat();
  const documentId = id ? parseInt(id) : 0;

  const { data: document, isLoading, error } = useQuery({
    queryKey: ['/api/documents', documentId, 'pdf'],
    queryFn: () => generatePDF(documentId),
    enabled: !isNaN(documentId)
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading document',
        description: 'Could not load the document. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-pulse space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Document Not Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The document you're looking for could not be found or has been deleted.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setLocation('/documents')}>
                    Back to Documents
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderDocumentContent = () => {
    if (document.documentType === 'income_statement') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Period</h3>
            <p className="text-gray-700">
              {formatDate(document.data.periodStart)} to {formatDate(document.data.periodEnd)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <div className="space-y-2">
              {document.data.revenue.categories && document.data.revenue.categories.map((category: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{category.category}</span>
                  <span>{formatCurrency(category.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Revenue</span>
                <span>{formatCurrency(document.data.revenue.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Expenses</h3>
            <div className="space-y-2">
              {document.data.expenses.categories && document.data.expenses.categories.map((category: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{category.category}</span>
                  <span>{formatCurrency(category.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Expenses</span>
                <span>{formatCurrency(document.data.expenses.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Net Profit</span>
                <span>{formatCurrency(document.data.profit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin</span>
                <span>{document.data.profitMargin.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (document.documentType === 'cash_flow') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Period</h3>
            <p className="text-gray-700">
              {formatDate(document.data.periodStart)} to {formatDate(document.data.periodEnd)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Operating Activities</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Net Income</span>
                <span>{formatCurrency(document.data.operatingActivities.netIncome)}</span>
              </div>
              {document.data.operatingActivities.adjustments && document.data.operatingActivities.adjustments.map((adj: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{adj.description}</span>
                  <span>{formatCurrency(adj.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net Cash from Operating Activities</span>
                <span>{formatCurrency(document.data.operatingActivities.netCash)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Investing Activities</h3>
            <div className="space-y-2">
              {document.data.investingActivities.items && document.data.investingActivities.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net Cash from Investing Activities</span>
                <span>{formatCurrency(document.data.investingActivities.netCash)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Financing Activities</h3>
            <div className="space-y-2">
              {document.data.financingActivities.items && document.data.financingActivities.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net Cash from Financing Activities</span>
                <span>{formatCurrency(document.data.financingActivities.netCash)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Starting Balance</span>
                <span>{formatCurrency(document.data.startingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Net Change in Cash</span>
                <span>{formatCurrency(document.data.netChange)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Ending Balance</span>
                <span>{formatCurrency(document.data.endingBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Generic document content
      return (
        <div>
          <p className="text-gray-700">{document.content || 'No content available'}</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{document.title}</h1>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setLocation('/documents')}>
                  Back to Documents
                </Button>
                <Button variant="outline" onClick={toggleChat}>
                  Ask AI
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(document.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                {renderDocumentContent()}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <PdfGenerator 
                  documentId={documentId} 
                  documentType={document.documentType} 
                  documentTitle={document.title} 
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}