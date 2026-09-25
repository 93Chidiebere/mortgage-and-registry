import { Router } from 'express';
import { getLenders, getLenderById, onboardLender } from '../controllers/lenderController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', getLenders);
router.post('/', authMiddleware, onboardLender);
router.get('/:id', getLenderById);

export default router;
