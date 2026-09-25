import { Request, Response } from 'express';
import Invoice from '../models/Invoice';

export const getRevenue = async (req: Request | any, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view revenue' });
    }

    const invoices = await Invoice.find().populate('lenderId', 'name');
    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);

    res.json({ totalRevenue, invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
