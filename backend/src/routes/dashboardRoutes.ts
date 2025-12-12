import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin only
router.get('/stats', authenticate, authorize('ADMIN'), getStats);

export default router;
