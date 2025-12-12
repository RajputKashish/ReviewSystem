import { Router } from 'express';
import { signup, login, updatePassword, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateSignup, validatePassword } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', login);

// Protected routes
router.put('/password', authenticate, validatePassword, updatePassword);
router.get('/profile', authenticate, getProfile);

export default router;
