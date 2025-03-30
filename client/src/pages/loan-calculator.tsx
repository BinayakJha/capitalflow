import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { queryClient, apiRequest } from '../lib/queryClient';
import { useQuery } from '@tanstack/react-query';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, HelpCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Form validation schema
const loanCalculatorSchema = z.object({
  loanType: z.string(),
  loanAmount: z.coerce.number().min(1000, "Loan amount must be at least $1,000"),
  collateral: z.object({
    available: z.boolean(),
    type: z.string().optional(),
    value: z.coerce.number().optional(),
  }),
  businessInfo: z.object({
    ageInMonths: z.coerce.number().min(1, "Business must be at least 1 month old"),
    industry: z.string(),
    annualRevenue: z.coerce.number().min(0, "Annual revenue cannot be negative"),
  }),
  ownerInfo: z.object({
    creditScore: z.coerce.number().min(300, "Credit score must be between 300-850").max(850, "Credit score must be between 300-850"),
    ficoScore: z.coerce.number().min(300, "FICO score must be between 300-850").max(850, "FICO score must be between 300-850").optional(),
  }),
  cashFlow: z.object({
    monthlyCashFlow: z.coerce.number(),
    debtToIncomeRatio: z.coerce.number().min(0, "Ratio must be a positive number").max(1, "Ratio must be between 0 and 1"),
    profitMargin: z.coerce.number().min(-1, "Margin must be greater than -100%").max(1, "Margin must be less than 100%"),
  }),
});

type LoanCalculatorValues = z.infer<typeof loanCalculatorSchema>;

// Default form values
const defaultValues: LoanCalculatorValues = {
  loanType: 'SBA Loan',
  loanAmount: 100000,
  collateral: {
    available: false,
    type: '',
    value: 0,
  },
  businessInfo: {
    ageInMonths: 24,
    industry: 'Technology',
    annualRevenue: 250000,
  },
  ownerInfo: {
    creditScore: 700,
    ficoScore: 680,
  },
  cashFlow: {
    monthlyCashFlow: 15000,
    debtToIncomeRatio: 0.3,
    profitMargin: 0.15,
  },
};

export default function LoanCalculator() {
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  // Set up form with validation
  const form = useForm<LoanCalculatorValues>({
    resolver: zodResolver(loanCalculatorSchema),
    defaultValues,
  });

  // Watch collateral availability to conditionally show fields
  const collateralAvailable = form.watch('collateral.available');

  // Fetch loan types and options
  const { data: loanOptions } = useQuery({
    queryKey: ['/api/loan-calculator/types'],
    queryFn: async () => {
      const response = await apiRequest('/api/loan-calculator/types');
      return response;
    },
  });

  // Form submission handler
  const onSubmit = async (values: LoanCalculatorValues) => {
    try {
      setLoading(true);

      // If collateral is not available, ensure fields are nullified
      if (!values.collateral.available) {
        values.collateral.type = '';
        values.collateral.value = 0;
      }

      // Submit to API
      const result = await apiRequest('/api/loan-calculator/approval', 'POST', values);

      setApproval(result);
      setActiveTab('results');
    } catch (error) {
      console.error('Error calculating loan approval:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate probability color
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    if (probability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Business Loan Approval Calculator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="input">Loan Information</TabsTrigger>
          <TabsTrigger value="results" disabled={!approval}>Results & Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>
                  Enter information about the loan you're seeking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="loanType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loanOptions?.types.map((type: any) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Different loan types have different requirements and approval odds
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="collateral.available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Collateral Available
                            </FormLabel>
                            <FormDescription>
                              Do you have assets to offer as collateral?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {collateralAvailable && (
                      <>
                        <FormField
                          control={form.control}
                          name="collateral.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collateral Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Real estate, equipment, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="collateral.value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collateral Value ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="50000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="businessInfo.ageInMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Age (months)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="24" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long has your business been operating?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessInfo.industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loanOptions?.industries.map((industry: string) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessInfo.annualRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Revenue ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="250000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="ownerInfo.creditScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credit Score</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="700" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your personal credit score (300-850)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ownerInfo.ficoScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FICO Score (optional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="680" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your FICO score if different from credit score
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="cashFlow.monthlyCashFlow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Cash Flow ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="15000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Average monthly net cash flow (revenue - expenses)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cashFlow.debtToIncomeRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Debt-to-Income Ratio</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.3" step="0.01" min="0" max="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ratio of monthly debt payments to income (0.0-1.0)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cashFlow.profitMargin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit Margin</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.15" step="0.01" min="-1" max="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Net profit divided by revenue (0.0-1.0)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Calculating...' : 'Calculate Approval Odds'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Type Info</CardTitle>
                  <CardDescription>
                    Information about different loan types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loanOptions?.types.map((type: any) => (
                    <div key={type.id} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-medium">Pros</h4>
                          <ul className="text-sm">
                            {type.pros.map((pro: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Cons</h4>
                          <ul className="text-sm">
                            {type.cons.map((con: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Time to funding:</span> {type.timeToFunding}
                      </div>
                      
                      {type.id !== loanOptions.types[loanOptions.types.length - 1].id && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Understanding loan qualifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      What is collateral?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Collateral refers to assets you pledge to secure a loan. If you default, the lender can claim these assets. Common collateral includes real estate, equipment, inventory, or accounts receivable.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      How does credit score affect my application?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your credit score is a major factor in loan approval. Higher scores (700+) indicate lower risk to lenders and can result in better interest rates and approval odds. Scores below 650 may need additional strengths in other areas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Why does business age matter?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Lenders consider younger businesses riskier since they lack a long track record. Businesses with 2+ years in operation generally have better approval odds, while startups often need to seek alternative financing options.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {approval && (
          <TabsContent value="results">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Loan Approval Analysis</CardTitle>
                  <CardDescription>
                    Based on the information you provided
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <h3 className="text-lg font-medium mb-2">Approval Probability</h3>
                    <div className="w-full mb-2">
                      <Progress 
                        value={approval.approvalProbability} 
                        className={`h-3 ${getProbabilityColor(approval.approvalProbability)}`} 
                      />
                    </div>
                    <p className="text-3xl font-bold">{approval.approvalProbability}%</p>
                    
                    <div className="mt-4">
                      {approval.approvalProbability >= 80 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 mx-auto">
                          <CheckCircle className="h-4 w-4" />
                          Excellent Approval Odds
                        </Badge>
                      ) : approval.approvalProbability >= 60 ? (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1 mx-auto">
                          <AlertTriangle className="h-4 w-4" />
                          Good Approval Odds
                        </Badge>
                      ) : approval.approvalProbability >= 40 ? (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex items-center gap-1 mx-auto">
                          <AlertTriangle className="h-4 w-4" />
                          Fair Approval Odds
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1 mx-auto">
                          <XCircle className="h-4 w-4" />
                          Low Approval Odds
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {approval.suggestedLoanType !== form.getValues().loanType && (
                    <Alert className="bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Alternative suggestion</AlertTitle>
                      <AlertDescription>
                        Based on your profile, a {approval.suggestedLoanType} might be a better fit with higher approval odds.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                    {approval.improvements.length > 0 ? (
                      <ul className="space-y-2">
                        {approval.improvements.map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Your application looks strong! No critical improvements needed.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Required Documents</h3>
                    <ul className="space-y-2">
                      {approval.requiredDocuments.map((doc: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Expected Time to Funding</h3>
                    <p className="text-xl font-semibold">{approval.timeToFunding}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveTab('input')}>
                    Revise Application
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{approval.suggestedLoanType}</CardTitle>
                  <CardDescription>
                    Summary of this loan type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium">Pros</h3>
                    <ul className="space-y-1 mt-1">
                      {approval.pros.map((pro: string, i: number) => (
                        <li key={i} className="flex items-start gap-1 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium">Cons</h3>
                    <ul className="space-y-1 mt-1">
                      {approval.cons.map((con: string, i: number) => (
                        <li key={i} className="flex items-start gap-1 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium">Next Steps</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ready to move forward? Consider these next steps:
                    </p>
                    <ul className="space-y-1 mt-2">
                      <li className="flex items-start gap-1 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Gather all required documents listed above</span>
                      </li>
                      <li className="flex items-start gap-1 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Implement suggested improvements where possible</span>
                      </li>
                      <li className="flex items-start gap-1 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Research specific lenders for this loan type</span>
                      </li>
                      <li className="flex items-start gap-1 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Prepare a detailed business plan and financial projections</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}