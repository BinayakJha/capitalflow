import { LoanType, LoanApprovalInput, LoanApprovalResult } from '../../shared/types';

// Defining scoring parameters for different loan types
const LOAN_TYPE_SCORES: Record<LoanType, {
  baseScore: number;
  minRequirements: {
    collateralValue: number; // as percentage of loan amount
    businessAge: number; // in months
    creditScore: number;
    cashFlow: boolean; // is cash flow info required?
  };
  timeToFunding: string;
  requiredDocuments: string[];
  collateralImportance: number; // 0-1
  businessAgeImportance: number; // 0-1
  creditScoreImportance: number; // 0-1
  cashFlowImportance: number; // 0-1
  pros: string[];
  cons: string[];
}> = {
  'SBA Loan': {
    baseScore: 20,
    minRequirements: {
      collateralValue: 0.2,
      businessAge: 24, // 2 years
      creditScore: 650,
      cashFlow: true,
    },
    timeToFunding: '30-90 days',
    requiredDocuments: [
      'Business financial statements for past 3 years',
      'Business tax returns for past 3 years',
      'Personal tax returns for past 3 years',
      'Personal financial statement',
      'Business plan with projections',
      'Use of funds documentation',
      'Business licenses and registrations',
      'Business debt schedule',
    ],
    collateralImportance: 0.8,
    businessAgeImportance: 0.9,
    creditScoreImportance: 0.7,
    cashFlowImportance: 0.9,
    pros: [
      'Low interest rates',
      'Longer repayment terms (up to 25 years)',
      'Higher approval rates for established businesses',
    ],
    cons: [
      'Downpayment or collateral required',
      'Extensive documentation needed',
      'Longer approval process (weeks to months)',
    ],
  },
  'Term Loan': {
    baseScore: 25,
    minRequirements: {
      collateralValue: 0.3,
      businessAge: 12, // 1 year
      creditScore: 680,
      cashFlow: true,
    },
    timeToFunding: '2-7 days',
    requiredDocuments: [
      'Business financial statements for past 2 years',
      'Business tax returns for past 2 years',
      'Personal tax returns',
      'Business bank statements (3-6 months)',
      'Business debt schedule',
    ],
    collateralImportance: 0.7,
    businessAgeImportance: 0.7,
    creditScoreImportance: 0.8,
    cashFlowImportance: 0.8,
    pros: [
      'Competitive interest rates',
      'Fixed payment schedule',
      'Build business credit history',
    ],
    cons: [
      'Stricter qualification requirements',
      'May require collateral',
      'Less flexible than line of credit',
    ],
  },
  'Line of Credit': {
    baseScore: 30,
    minRequirements: {
      collateralValue: 0.0,
      businessAge: 6, // 6 months
      creditScore: 650,
      cashFlow: true,
    },
    timeToFunding: '1-3 days',
    requiredDocuments: [
      'Business bank statements (3 months)',
      'Business financial statements',
      'Personal tax returns',
      'Business debt schedule',
    ],
    collateralImportance: 0.3,
    businessAgeImportance: 0.5,
    creditScoreImportance: 0.8,
    cashFlowImportance: 0.9,
    pros: [
      'Flexible use of funds',
      'Only pay interest on amount borrowed',
      'Revolving credit (borrow again as you repay)',
    ],
    cons: [
      'Account fees may apply',
      'Variable interest rates',
      'Can lead to debt cycles if not managed properly',
    ],
  },
  'Revenue-Based Financing': {
    baseScore: 35,
    minRequirements: {
      collateralValue: 0.0,
      businessAge: 3, // 3 months
      creditScore: 550,
      cashFlow: false,
    },
    timeToFunding: '1-5 days',
    requiredDocuments: [
      'Business bank statements (3-6 months)',
      'Financial processing statements (if applicable)',
      'Proof of business operations',
    ],
    collateralImportance: 0.0,
    businessAgeImportance: 0.3,
    creditScoreImportance: 0.4,
    cashFlowImportance: 0.6,
    pros: [
      'Easier approval than traditional loans',
      'No fixed payment schedule',
      'No collateral required',
    ],
    cons: [
      'Higher cost of financing',
      'Percentage of revenue goes to repayment',
      'Less predictable payment schedule',
    ],
  },
};

// Industry risk factors (higher is better)
const INDUSTRY_SCORES: Record<string, number> = {
  'Technology': 0.9,
  'Healthcare': 0.85,
  'Food & Beverage': 0.7,
  'Retail': 0.65,
  'Manufacturing': 0.8,
  'Construction': 0.6,
  'Professional Services': 0.85,
  'Hospitality': 0.5,
  'Education': 0.75,
  'Real Estate': 0.7,
  'Transportation': 0.65,
  'Agriculture': 0.6,
  'Entertainment': 0.7,
  'default': 0.65, // For industries not explicitly listed
};

/**
 * Calculate loan approval probability and provide recommendations
 */
export function calculateLoanApproval(input: LoanApprovalInput): LoanApprovalResult {
  // Get loan type specific scoring
  const loanTypeScoring = LOAN_TYPE_SCORES[input.loanType];
  
  // Start with base score for this loan type
  let score = loanTypeScoring.baseScore;
  
  // Track improvement suggestions
  const improvements: string[] = [];
  
  // Calculate collateral factor (0-1)
  let collateralFactor = 0;
  if (input.collateral.available) {
    // Calculate as percentage of loan amount
    collateralFactor = Math.min(1, input.collateral.value / input.loanAmount);
    
    if (collateralFactor < loanTypeScoring.minRequirements.collateralValue) {
      improvements.push(`Increase collateral value to at least ${loanTypeScoring.minRequirements.collateralValue * 100}% of loan amount`);
    }
  } else if (loanTypeScoring.minRequirements.collateralValue > 0) {
    improvements.push(`Provide collateral worth at least ${loanTypeScoring.minRequirements.collateralValue * 100}% of loan amount`);
  }
  
  // Apply collateral factor to score
  score += (collateralFactor * 10 * loanTypeScoring.collateralImportance);
  
  // Calculate business age factor (0-1)
  const businessAgeFactor = Math.min(1, input.businessInfo.ageInMonths / 60); // Max benefit at 5 years
  if (input.businessInfo.ageInMonths < loanTypeScoring.minRequirements.businessAge) {
    improvements.push(`Business age (${Math.floor(input.businessInfo.ageInMonths / 12)} years, ${input.businessInfo.ageInMonths % 12} months) is below recommended minimum of ${Math.floor(loanTypeScoring.minRequirements.businessAge / 12)} years for this loan type`);
  }
  
  // Apply business age factor to score
  score += (businessAgeFactor * 10 * loanTypeScoring.businessAgeImportance);
  
  // Calculate credit score factor (0-1)
  const creditScoreFactor = Math.min(1, Math.max(0, (input.ownerInfo.creditScore - 500) / 300)); // 500-800 range
  if (input.ownerInfo.creditScore < loanTypeScoring.minRequirements.creditScore) {
    improvements.push(`Credit score (${input.ownerInfo.creditScore}) is below recommended minimum of ${loanTypeScoring.minRequirements.creditScore} for this loan type`);
  }
  
  // Apply credit score factor to score
  score += (creditScoreFactor * 15 * loanTypeScoring.creditScoreImportance);
  
  // Calculate industry factor (0-1)
  const industryFactor = INDUSTRY_SCORES[input.businessInfo.industry] || INDUSTRY_SCORES.default;
  
  // Apply industry factor to score
  score += (industryFactor * 5);
  
  // Calculate cash flow factors if available
  if (input.cashFlow) {
    // Positive monthly cash flow is good
    const cashFlowFactor = input.cashFlow.monthlyCashFlow > 0 ? 
      Math.min(1, input.cashFlow.monthlyCashFlow / (input.loanAmount * 0.05)) : 0;
    
    // Debt-to-income ratio (lower is better)
    const dtiAcceptable = input.cashFlow.debtToIncomeRatio < 0.5;
    if (!dtiAcceptable) {
      improvements.push(`Reduce debt-to-income ratio from ${(input.cashFlow.debtToIncomeRatio * 100).toFixed(1)}% to below 50%`);
    }
    
    // Profit margin (higher is better)
    const profitMarginFactor = Math.min(1, input.cashFlow.profitMargin / 0.2); // 20% profit margin for max benefit
    if (profitMarginFactor < 0.5) {
      improvements.push(`Work on improving profit margin from ${(input.cashFlow.profitMargin * 100).toFixed(1)}% to at least 10%`);
    }
    
    // Apply cash flow factors to score
    score += (cashFlowFactor * 10 * loanTypeScoring.cashFlowImportance);
    score += (dtiAcceptable ? 5 : 0) * loanTypeScoring.cashFlowImportance;
    score += (profitMarginFactor * 5 * loanTypeScoring.cashFlowImportance);
  } else if (loanTypeScoring.minRequirements.cashFlow) {
    improvements.push('Provide cash flow information to improve approval odds');
  }
  
  // Revenue factor
  const revenueFactor = Math.min(1, input.businessInfo.annualRevenue / (input.loanAmount * 2));
  score += (revenueFactor * 10);
  
  if (revenueFactor < 0.5) {
    improvements.push(`Annual revenue (${formatCurrency(input.businessInfo.annualRevenue)}) is low compared to requested loan amount (${formatCurrency(input.loanAmount)})`);
  }
  
  // Cap final score at 100
  score = Math.min(100, Math.max(0, score));
  
  // Find best alternative loan type if current type has low probability
  let suggestedLoanType = input.loanType;
  if (score < 60) {
    const alternatives = Object.entries(LOAN_TYPE_SCORES)
      .filter(([type]) => type !== input.loanType)
      .map(([type, scoring]) => {
        // Crude estimation for alternative score
        const altBase = scoring.baseScore;
        const collateralMatch = input.collateral.available && 
          (input.collateral.value / input.loanAmount) >= scoring.minRequirements.collateralValue;
        const ageMatch = input.businessInfo.ageInMonths >= scoring.minRequirements.businessAge;
        const creditMatch = input.ownerInfo.creditScore >= scoring.minRequirements.creditScore;
        
        // Calculate estimated score for alternative
        let altScore = altBase;
        if (collateralMatch) altScore += 10;
        if (ageMatch) altScore += 10;
        if (creditMatch) altScore += 15;
        
        return { type, score: altScore };
      })
      .sort((a, b) => b.score - a.score);
    
    if (alternatives.length > 0 && alternatives[0].score > score) {
      suggestedLoanType = alternatives[0].type as LoanType;
      improvements.push(`Consider applying for a ${suggestedLoanType} instead, which may have better approval odds`);
    }
  }
  
  return {
    approvalProbability: Math.round(score),
    suggestedLoanType,
    timeToFunding: LOAN_TYPE_SCORES[suggestedLoanType].timeToFunding,
    requiredDocuments: LOAN_TYPE_SCORES[suggestedLoanType].requiredDocuments,
    improvements,
    pros: LOAN_TYPE_SCORES[suggestedLoanType].pros,
    cons: LOAN_TYPE_SCORES[suggestedLoanType].cons,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}