import { Router } from 'express';
import { createApplication, getMyApplications } from '../controllers/applicationController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, createApplication);
router.get('/me', authMiddleware, getMyApplications);

export default router;
