import { Router } from 'express';
import { getStations, getStation } from '../controllers/stationController.js';
import { validateUuidParam } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/stations
router.get('/', getStations);

// GET /api/stations/:id
router.get('/:id', validateUuidParam, getStation);

export default router;