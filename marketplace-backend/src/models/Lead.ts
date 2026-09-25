import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  applicationId: mongoose.Types.ObjectId;
  lenderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone: string;
  loanAmount: number;
  propertyValue: number;
  status: 'new' | 'accepted' | 'rejected' | 'in_progress' | 'approved' | 'closed' | 'disbursed';
  approvalProbability: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'MortgageApplication', required: true },
  lenderId: { type: Schema.Types.ObjectId, ref: 'Lender', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  propertyValue: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['new', 'accepted', 'rejected', 'in_progress', 'approved', 'closed', 'disbursed'],
    default: 'new'
  },
  approvalProbability: { type: String, enum: ['high', 'medium', 'low'], required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<ILead>('Lead', LeadSchema);
