import { Request, Response } from 'express';
import MortgageApplication from '../models/MortgageApplication';
import Lead from '../models/Lead';

export const createApplication = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const application = new MortgageApplication({
      ...req.body,
      userId,
      status: 'submitted'
    });

    await application.save();

    // If lenders are selected, create leads for them
    if (application.selectedLenders && application.selectedLenders.length > 0) {
      const leads = application.selectedLenders.map((lenderId: any) => ({
        applicationId: application._id,
        lenderId,
        userId,
        userName: req.user.name || 'Applicant', // In real app, fetch user details
        userEmail: req.user.email || 'email@example.com',
        userPhone: '000000000', // Fetch actual
        loanAmount: application.loanAmount,
        propertyValue: application.propertyValue,
        status: 'new',
        approvalProbability: 'medium'
      }));
      await Lead.insertMany(leads);
    }

    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyApplications = async (req: Request | any, res: Response) => {
  try {
    const applications = await MortgageApplication.find({ userId: req.user.id })
      .populate('selectedLenders', 'name logo');
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
