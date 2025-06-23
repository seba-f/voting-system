import express from 'express';
import { verifyToken } from '../controllers/authController';
import { 
    createBallot, 
    getActiveBallotsForCategory,
    getPastBallotsForCategory,
    getSuspendedBallotsForCategory,
    getBallot,
    getActiveBallotsForUser,
    getUnvotedBallots,
    getVotedBallots
} from '../controllers/ballot/ballotsController';

import {
    submitVote,
    getUserVote
} from '../controllers/ballot/ballotVotingController';

import {
    getBallotAnalytics
} from '../controllers/ballot/ballotAnalyticsController';

import {
    suspendBallot,
    unsuspendBallot,
    endBallotEarly
} from '../controllers/ballot/ballotStateController';

import {
    getActiveBallotsWithVoteStatus,
    getPastBallotsWithVoteStatus
} from '../controllers/ballot/ballotStatusController';

const router = express.Router();

// Create a new ballot
router.post('/', verifyToken, createBallot);

// Get ballots by status
router.get('/active', verifyToken, getActiveBallotsForCategory);
router.get('/active/:userId', verifyToken, getActiveBallotsForUser);
router.get('/past', verifyToken, getPastBallotsForCategory);
router.get('/suspended', verifyToken, getSuspendedBallotsForCategory);
router.get('/unvoted', verifyToken, getUnvotedBallots);
router.get('/active-with-status', verifyToken, getActiveBallotsWithVoteStatus);
router.get('/past-with-status', verifyToken, getPastBallotsWithVoteStatus);
router.get('/voted', verifyToken, getVotedBallots);
router.get('/:id/analytics', verifyToken, getBallotAnalytics);
router.get('/:id/vote', verifyToken, getUserVote);
router.get('/:id', verifyToken, getBallot);
router.post('/:id/vote', verifyToken, submitVote);
router.post('/:id/suspend', verifyToken, suspendBallot);
router.post('/:id/unsuspend', verifyToken, unsuspendBallot);
router.post('/:id/end', verifyToken, endBallotEarly);

export default router;
