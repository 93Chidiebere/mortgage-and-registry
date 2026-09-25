import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  name: string;
  type: 'id' | 'payslip' | 'bank_statement' | 'offer_letter' | 'property_doc' | 'other';
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface IMortgageApplication extends Document {
  userId: mongoose.Types.ObjectId;
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
  documents: IDocument[];
  selectedLenders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['id', 'payslip', 'bank_statement', 'offer_letter', 'property_doc', 'other'], required: true },
  url: { type: String, required: true },
  verified: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});

const MortgageApplicationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'under_review', 'conditional_approval', 'valuation', 'offer_issued', 'completed', 'rejected'],
    default: 'draft'
  },
  employmentType: { type: String, enum: ['salaried', 'self_employed'], required: true },
  propertyType: { type: String, enum: ['off_plan', 'completed', 'construction'], required: true },
  propertyValue: { type: Number, required: true },
  loanAmount: { type: Number, required: true },
  tenure: { type: Number, required: true },
  monthlyIncome: { type: Number, required: true },
  existingObligations: { type: Number, default: 0 },
  state: { type: String, required: true },
  city: { type: String, required: true },
  propertyAddress: { type: String },
  documents: [DocumentSchema],
  selectedLenders: [{ type: Schema.Types.ObjectId, ref: 'Lender' }]
}, { timestamps: true });

export default mongoose.model<IMortgageApplication>('MortgageApplication', MortgageApplicationSchema);
