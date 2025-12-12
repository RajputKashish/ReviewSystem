import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateUser } from '../middleware/validation';

const router = Router();

// All routes require admin access
router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', validateUser, createUser);

export default router;
