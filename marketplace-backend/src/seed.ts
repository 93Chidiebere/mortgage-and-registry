import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Lender from './models/Lender';
import MortgageProduct from './models/MortgageProduct';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mortgage-ng';

const lenders = [
  {
    name: 'First Primary Mortgage Bank',
    shortName: 'First PMB',
    type: 'pmb',
    email: 'info@firstpmb.com',
    phone: '+234 1 234 5678',
    address: '123 Victoria Island, Lagos',
    isActive: true,
    leadFee: 150000,
    subscription: 'premium'
  },
  {
    name: 'Access Bank Mortgage',
    shortName: 'Access Mortgage',
    type: 'commercial',
    email: 'mortgage@accessbank.com',
    phone: '+234 1 456 7890',
    address: '789 Marina, Lagos',
    isActive: true,
    leadFee: 200000,
    subscription: 'premium'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Lender.deleteMany();
    await MortgageProduct.deleteMany();

    // Create Admin and Consumer Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    await User.create({
      email: 'vchidiebere.vc@gmail.com',
      name: 'Chidiebere',
      passwordHash,
      role: 'consumer',
      kycStatus: 'verified'
    });

    await User.create({
      email: 'admin@mortgageng.com',
      name: 'Admin Manager',
      passwordHash,
      role: 'admin',
      kycStatus: 'verified'
    });

    // Create Lenders
    const createdLenders = await Lender.insertMany(lenders);

    // Create Products for First Lender
    await MortgageProduct.create({
      lenderId: createdLenders[0]._id,
      lenderName: createdLenders[0].name,
      name: 'First Home Starter',
      interestRate: 18.5,
      rateType: 'fixed',
      minTenure: 5,
      maxTenure: 20,
      minLoanAmount: 5000000,
      maxLoanAmount: 50000000,
      minDownPayment: 20,
      maxLTV: 80,
      processingFee: 1,
      legalFee: 0.5,
      insuranceFee: 0.25,
      adminFee: 50000,
      eligibleStates: ['Lagos', 'Ogun', 'FCT', 'Rivers'],
      minIncome: 250000,
      mortgageType: 'conventional'
    });

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
