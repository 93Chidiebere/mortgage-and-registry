export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'lender' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: Date;
  kycStatus?: 'pending' | 'verified' | 'expired';
  bvnVerified?: boolean;
  ninVerified?: boolean;
  lenderId?: string; // For lender users
}

export interface MortgageApplication {
  id: string;
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'conditional_approval' | 'valuation' | 'offer_issued' | 'completed' | 'rejected';
  employmentType: 'salaried' | 'self_employed';
  propertyType: 'off_plan' | 'completed' | 'construction';
  propertyValue: number;
  loanAmount: number;
  tenure: number;
  monthlyIncome: number;
  existingObligations: number;
  state: string;
  city: string;
  propertyAddress?: string;
  documents: Document[];
  selectedLenders: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'id' | 'payslip' | 'bank_statement' | 'offer_letter' | 'property_doc' | 'other';
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface MortgageProduct {
  id: string;
  lenderId: string;
  lenderName: string;
  lenderLogo?: string;
  name: string;
  interestRate: number;
  rateType: 'fixed' | 'variable';
  minTenure: number;
  maxTenure: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minDownPayment: number;
  maxLTV: number;
  processingFee: number;
  legalFee: number;
  insuranceFee: number;
  adminFee: number;
  eligibleStates: string[];
  minIncome: number;
  mortgageType: 'conventional' | 'islamic';
  isActive: boolean;
  isPromotional: boolean;
  features: string[];
  createdAt: Date;
}

export interface Lender {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  type: 'pmb' | 'commercial';
  email: string;
  phone: string;
  address: string;
  website?: string;
  isActive: boolean;
  leadFee: number;
  subscription: 'basic' | 'premium';
  createdAt: Date;
}

export interface Lead {
  id: string;
  applicationId: string;
  lenderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  loanAmount: number;
  propertyValue: number;
  status: 'new' | 'accepted' | 'rejected' | 'in_progress' | 'approved' | 'closed';
  approvalProbability: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffordabilityResult {
  maxMortgage: number;
  estimatedMonthly: number;
  debtToIncome: number;
  eligibleProducts: MortgageProduct[];
}

export interface ComparisonResult {
  product: MortgageProduct;
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  effectiveRate: number;
  ranking: {
    overall: number;
    lowestMonthly: number;
    lowestTotal: number;
  };
  approvalProbability: 'high' | 'medium' | 'low';
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const APPLICATION_STATUSES = {
  draft: { label: 'Draft', color: 'muted' },
  submitted: { label: 'Submitted', color: 'info' },
  under_review: { label: 'Under Review', color: 'warning' },
  conditional_approval: { label: 'Conditional Approval', color: 'success' },
  valuation: { label: 'Valuation', color: 'warning' },
  offer_issued: { label: 'Offer Issued', color: 'success' },
  completed: { label: 'Completed', color: 'success' },
  rejected: { label: 'Rejected', color: 'destructive' },
} as const;
