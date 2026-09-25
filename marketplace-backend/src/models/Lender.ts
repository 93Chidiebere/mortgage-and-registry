import mongoose, { Schema, Document } from 'mongoose';

export interface ILender extends Document {
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

const LenderSchema: Schema = new Schema({
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  logo: { type: String },
  type: { type: String, enum: ['pmb', 'commercial'], required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  isActive: { type: Boolean, default: true },
  leadFee: { type: Number, required: true },
  subscription: { type: String, enum: ['basic', 'premium'], default: 'basic' }
}, { timestamps: true });

export default mongoose.model<ILender>('Lender', LenderSchema);
