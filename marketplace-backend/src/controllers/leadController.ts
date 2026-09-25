import { Request, Response } from 'express';
import Lead from '../models/Lead';
import Invoice from '../models/Invoice';

export const getLenderLeads = async (req: Request | any, res: Response) => {
  try {
    const lenderId = req.user.lenderId || req.query.lenderId; 
    
    if (!lenderId) {
      return res.status(400).json({ message: 'Lender ID is required' });
    }

    const leads = await Lead.find({ lenderId })
      .populate('applicationId');
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const previousStatus = lead.status;
    lead.status = status;
    lead.updatedAt = new Date();
    await lead.save();

    // Business Logic: 500k flat fee per disbursement
    if (status === 'disbursed' && previousStatus !== 'disbursed') {
      const invoice = new Invoice({
        lenderId: lead.lenderId,
        leadId: lead._id,
        amount: 500000,
        description: `Disbursement fee for Lead ${lead._id}`
      });
      await invoice.save();
      console.log(`Generated Invoice of 500,000 NGN for Lender ${lead.lenderId}`);
    }

    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
