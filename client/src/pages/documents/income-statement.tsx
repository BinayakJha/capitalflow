import { useState } from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { generateIncomeStatement } from '@/lib/api';
import { format } from 'date-fns';

export default function IncomeStatement() {
  const { isChatOpen, toggleChat } = useChat();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState('Income Statement');
  
  const generateMutation = useMutation({
    mutationFn: generateIncomeStatement,
    onSuccess: (data) => {
      toast({
        title: 'Income statement generated',
        description: 'Your document has been created successfully',
      });
      setLocation('/documents');
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: (error as Error).message || 'Failed to generate income statement',
        variant: 'destructive',
      });
    },
  });
  
  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Missing dates',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }
    
    if (startDate > endDate) {
      toast({
        title: 'Invalid date range',
        description: 'Start date must be before end date',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await generateMutation.mutateAsync({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Error generating income statement:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Generate Income Statement</h1>
              <Button variant="outline" onClick={toggleChat}>
                Need help?
              </Button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Income Statement"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        Capital One's Nessie API will be used to fetch transaction data for the specified period.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setLocation('/documents')}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Statement'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Preview section - would show a preview of the document structure */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-700">Revenue</h3>
                      <div className="h-8 bg-gray-100 rounded w-full mt-2"></div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-700">Expenses</h3>
                      <div className="h-8 bg-gray-100 rounded w-full mt-2"></div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-700">Net Income</h3>
                      <div className="h-8 bg-gray-100 rounded w-full mt-2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
