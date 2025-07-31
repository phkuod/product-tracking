import { Router } from 'express';
import { getRoutes, getRoute } from '../controllers/routeController.js';
import { validateUuidParam } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/routes
router.get('/', getRoutes);

// GET /api/routes/:id
router.get('/:id', validateUuidParam, getRoute);

export default router;