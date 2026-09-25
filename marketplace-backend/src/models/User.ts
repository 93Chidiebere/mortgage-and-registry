import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: 'consumer' | 'lender' | 'admin';
  phone?: string;
  avatar?: string;
  kycStatus: 'pending' | 'verified' | 'expired';
  bvnVerified: boolean;
  ninVerified: boolean;
  lenderId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['consumer', 'lender', 'admin'], default: 'consumer' },
  phone: { type: String },
  avatar: { type: String },
  kycStatus: { type: String, enum: ['pending', 'verified', 'expired'], default: 'pending' },
  bvnVerified: { type: Boolean, default: false },
  ninVerified: { type: Boolean, default: false },
  lenderId: { type: Schema.Types.ObjectId, ref: 'Lender' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
