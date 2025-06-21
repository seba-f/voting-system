import express from 'express';
import { verifyToken } from '../controllers/authController';
import { 
    createBallot, 
    getActiveBallotsForCategory,
    getPastBallotsForCategory,
    getSuspendedBallotsForCategory,
    getActiveBallotsForUser,
    getUnvotedBallots,
    getBallot,
    submitVote
} from '../controllers/ballotsController';

const router = express.Router();

// Create a new ballot
router.post('/', verifyToken, createBallot);

// Get ballots by status
router.get('/active', verifyToken, getActiveBallotsForCategory);
router.get('/active/:userId', verifyToken, getActiveBallotsForUser);
router.get('/past', verifyToken, getPastBallotsForCategory);
router.get('/suspended', verifyToken, getSuspendedBallotsForCategory);
router.get('/unvoted', verifyToken, getUnvotedBallots);
router.get('/:id', verifyToken, getBallot);
router.post('/:id/vote', verifyToken, submitVote);

export default router;
