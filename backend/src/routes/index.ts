import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import storeRoutes from './storeRoutes';
import ratingRoutes from './ratingRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
