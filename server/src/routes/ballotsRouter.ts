import express from 'express';
import { verifyToken } from '../controllers/authController';
import { 
    createBallot, 
    getActiveBallotsForCategory,
    getPastBallotsForCategory,
    getSuspendedBallotsForCategory
} from '../controllers/ballotsController';

const router = express.Router();

// Create a new ballot
router.post('/', verifyToken, createBallot);

// Get ballots by status
router.get('/active', verifyToken, getActiveBallotsForCategory);
router.get('/past', verifyToken, getPastBallotsForCategory);
router.get('/suspended', verifyToken, getSuspendedBallotsForCategory);

export default router;
