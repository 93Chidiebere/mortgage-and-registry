import mongoose, { Schema, Document } from 'mongoose';

export interface IMortgageProduct extends Document {
  lenderId: mongoose.Types.ObjectId;
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

const MortgageProductSchema: Schema = new Schema({
  lenderId: { type: Schema.Types.ObjectId, ref: 'Lender', required: true },
  lenderName: { type: String, required: true },
  lenderLogo: { type: String },
  name: { type: String, required: true },
  interestRate: { type: Number, required: true },
  rateType: { type: String, enum: ['fixed', 'variable'], required: true },
  minTenure: { type: Number, required: true },
  maxTenure: { type: Number, required: true },
  minLoanAmount: { type: Number, required: true },
  maxLoanAmount: { type: Number, required: true },
  minDownPayment: { type: Number, required: true },
  maxLTV: { type: Number, required: true },
  processingFee: { type: Number, required: true },
  legalFee: { type: Number, required: true },
  insuranceFee: { type: Number, required: true },
  adminFee: { type: Number, required: true },
  eligibleStates: [{ type: String }],
  minIncome: { type: Number, required: true },
  mortgageType: { type: String, enum: ['conventional', 'islamic'], required: true },
  isActive: { type: Boolean, default: true },
  isPromotional: { type: Boolean, default: false },
  features: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IMortgageProduct>('MortgageProduct', MortgageProductSchema);
