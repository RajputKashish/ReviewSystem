import { Router } from 'express';
import { getStores, getStoreById, createStore, getMyStore } from '../controllers/storeController';
import { authenticate, authorize } from '../middleware/auth';
import { validateStore } from '../middleware/validation';

const router = Router();

// Protected routes
router.get('/', authenticate, getStores);
router.get('/my-store', authenticate, authorize('STORE_OWNER'), getMyStore);
router.get('/:id', authenticate, getStoreById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), validateStore, createStore);

export default router;
