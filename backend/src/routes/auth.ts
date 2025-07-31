import { Router } from 'express';
import { login, refresh } from '../controllers/authController.js';
import { validateLogin } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/refresh
router.post('/refresh', authenticate, refresh);

export default router;