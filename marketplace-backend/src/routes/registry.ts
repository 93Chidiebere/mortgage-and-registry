import { Router } from 'express';
import { proposeSurvey, approveSurvey } from '../controllers/registryController';

const router = Router();

// In production, add your existing JWT middleware to these routes
router.post('/propose', proposeSurvey);
router.post('/:parcel_id/approve', approveSurvey);

export default router;
