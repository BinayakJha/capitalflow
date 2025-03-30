import { useState } from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AuditPrep() {
  const { isChatOpen, toggleChat } = useChat();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 1) // January 1st of current year
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 11, 31) // December 31st of current year
  );
  
  const [selectedItems, setSelectedItems] = useState({
    incomeStatement: true,
    cashFlow: true,
    balanceSheet: false,
    taxDocuments: false,
    bankStatements: true,
    invoices: true,
    receipts: false,
    payroll: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Audit preparation started',
        description: 'Your documents are being prepared. This process may take some time.',
      });
      setLocation('/documents');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Audit Preparation</h1>
              <Button variant="outline" onClick={toggleChat}>
                Need help?
              </Button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="income-statement" 
                        checked={selectedItems.incomeStatement}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, incomeStatement: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="income-statement"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Income Statement
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cash-flow" 
                        checked={selectedItems.cashFlow}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, cashFlow: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="cash-flow"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cash Flow Statement
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="balance-sheet" 
                        checked={selectedItems.balanceSheet}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, balanceSheet: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="balance-sheet"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Balance Sheet
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tax-documents" 
                        checked={selectedItems.taxDocuments}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, taxDocuments: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="tax-documents"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tax Documents
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bank-statements" 
                        checked={selectedItems.bankStatements}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, bankStatements: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="bank-statements"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Bank Statements
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="invoices" 
                        checked={selectedItems.invoices}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, invoices: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="invoices"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Invoices
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="receipts" 
                        checked={selectedItems.receipts}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, receipts: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="receipts"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Receipts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="payroll" 
                        checked={selectedItems.payroll}
                        onCheckedChange={(checked) => 
                          setSelectedItems({...selectedItems, payroll: !!checked})
                        }
                      />
                      <Label 
                        htmlFor="payroll"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Payroll Records
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-yellow-700">
                        Our AI will help prepare clean, audit-ready documents. This is not a replacement for professional audit services but will help you get prepared.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setLocation('/documents')}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Preparing...
                    </>
                  ) : (
                    'Start Preparation'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Information section */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Preparation Process</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        1
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-gray-900">Document Collection</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          We'll gather all selected documents from your integrated Capital One accounts.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        2
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-gray-900">AI Analysis</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Our AI reviews your financial data for inconsistencies, missing information, and potential audit flags.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        3
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-gray-900">Document Preparation</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Clean, formatted documents are generated with detailed footnotes and explanations.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        4
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-gray-900">Review & Export</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Review the prepared documents and export them as PDFs for your accountant or auditor.
                        </p>
                      </div>
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
