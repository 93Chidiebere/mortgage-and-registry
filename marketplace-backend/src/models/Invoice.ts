import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  lenderId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  lenderId: { type: Schema.Types.ObjectId, ref: 'Lender', required: true },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  amount: { type: Number, required: true, default: 500000 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  description: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
