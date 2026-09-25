import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Lender from '../models/Lender';
import MortgageProduct from '../models/MortgageProduct';

const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Lender.deleteMany();
    await MortgageProduct.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    await User.create({
      email: 'vchidiebere.vc@gmail.com',
      name: 'Chidiebere',
      passwordHash,
      role: 'consumer',
      kycStatus: 'verified'
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'complynigeria@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeImmediately123!';

    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);

    await User.create({
      email: adminEmail,
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      kycStatus: 'verified'
    });

    const createdLenders = await Lender.insertMany(lenders);

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

    res.json({ status: 'success', message: 'Live database seeded successfully from Vercel!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error seeding database', details: error.message });
  }
});

export default router;
