import { Router } from 'express';
import { getLenderLeads, updateLeadStatus } from '../controllers/leadController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getLenderLeads);
router.patch('/:id/status', authMiddleware, updateLeadStatus);

export default router;
