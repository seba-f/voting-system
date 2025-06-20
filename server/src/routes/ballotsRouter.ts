import express from 'express';
import { verifyToken } from '../controllers/authController';
import { 
    createBallot, 
    getActiveBallotsForCategory,
    getPastBallotsForCategory,
    getSuspendedBallotsForCategory,
    getActiveBallotsForUser
} from '../controllers/ballotsController';

const router = express.Router();

// Create a new ballot
router.post('/', verifyToken, createBallot);

// Get ballots by status
router.get('/active', verifyToken, getActiveBallotsForCategory);
router.get('/active/:userId', verifyToken, getActiveBallotsForUser);
router.get('/past', verifyToken, getPastBallotsForCategory);
router.get('/suspended', verifyToken, getSuspendedBallotsForCategory);

export default router;
