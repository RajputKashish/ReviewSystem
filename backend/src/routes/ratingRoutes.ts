import { Router } from 'express';
import { submitRating, updateRating, getStoreRatings, getUserRatings } from '../controllers/ratingController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRating } from '../middleware/validation';

const router = Router();

// User routes
router.post('/', authenticate, authorize('USER'), validateRating, submitRating);
router.put('/:storeId', authenticate, authorize('USER'), validateRating, updateRating);
router.get('/my-ratings', authenticate, authorize('USER'), getUserRatings);

// Store owner routes
router.get('/store/:storeId', authenticate, authorize('STORE_OWNER'), getStoreRatings);

export default router;
