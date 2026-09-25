import { Request, Response } from 'express';
import Lender from '../models/Lender';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const onboardLender = async (req: Request | any, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can onboard lenders' });
    }

    const { name, shortName, type, email, phone, address, leadFee } = req.body;

    const existingLender = await Lender.findOne({ email });
    if (existingLender) {
      return res.status(400).json({ message: 'Lender with this email already exists' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user account with this email already exists. Please use a different email for the bank manager.' });
    }

    const lender = new Lender({
      name, shortName, type, email, phone, address, leadFee
    });
    await lender.save();

    const rawPassword = Math.random().toString(36).slice(-8); // Random password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const user = new User({
      email,
      name: `Manager - ${shortName}`,
      passwordHash,
      role: 'lender',
      lenderId: lender._id,
      kycStatus: 'verified'
    });
    await user.save();

    // Mock Email Send
    console.log(`\n--- WELCOME EMAIL SENT TO ${email} ---`);
    console.log(`Subject: Welcome to MortgageNG Marketplace`);
    console.log(`Hello, your bank ${name} is onboarded. Login with Email: ${email} | Password: ${rawPassword}\n`);

    res.status(201).json({ lender, defaultPassword: rawPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLenders = async (req: Request, res: Response) => {
  try {
    const lenders = await Lender.find({ isActive: true });
    res.json(lenders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLenderById = async (req: Request, res: Response) => {
  try {
    const lender = await Lender.findById(req.params.id);
    if (!lender) {
      return res.status(404).json({ message: 'Lender not found' });
    }
    res.json(lender);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
