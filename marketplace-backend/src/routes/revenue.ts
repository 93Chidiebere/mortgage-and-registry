import { Router } from 'express';
import { getRevenue } from '../controllers/revenueController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getRevenue);

export default router;
