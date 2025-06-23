import { Response } from 'express';
import { AuthRequest } from '../../controllers/authController';
import Ballot from '../../models/entities/voting/ballotModel';
import { formatBallotResponse } from './ballotHelpers';

export const suspendBallot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = Number(req.params.id);
        const ballot = await Ballot.findByPk(ballotId);

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Check if user is the admin of this ballot
        if (ballot.adminId !== req.user.id) {
            res.status(403).json({ message: 'Unauthorized to modify this ballot' });
            return;
        }

        // Check if ballot is already suspended or ended
        if (ballot.isSuspended) {
            res.status(400).json({ message: 'Ballot is already suspended' });
            return;
        }

        const now = new Date();
        const endDate = new Date(ballot.limitDate);
        if (endDate < now) {
            res.status(400).json({ message: 'Cannot suspend an ended ballot' });
            return;
        }

        // Calculate time left in milliseconds
        const timeLeftMs = endDate.getTime() - now.getTime();
        
        // Set a distant future date (e.g., 100 years from now)
        const distantFuture = new Date();
        distantFuture.setFullYear(distantFuture.getFullYear() + 100);

        await ballot.update({
            isSuspended: true,
            timeLeft: Math.floor(timeLeftMs / 1000), // Store in seconds
            limitDate: distantFuture
        });

        const updatedBallot = await Ballot.findByPk(ballotId);
        res.json(formatBallotResponse(updatedBallot));
    } catch (error: any) {
        console.error('Error suspending ballot:', error);
        res.status(500).json({ message: 'Error suspending ballot', error: error.message });
    }
};

export const endBallotEarly = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = Number(req.params.id);
        const ballot = await Ballot.findByPk(ballotId);

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Check if user is the admin of this ballot
        if (ballot.adminId !== req.user.id) {
            res.status(403).json({ message: 'Unauthorized to modify this ballot' });
            return;
        }

        // Check if ballot is already ended
        const currentEndDate = new Date(ballot.limitDate);
        if (currentEndDate < new Date()) {
            res.status(400).json({ message: 'Ballot is already ended' });
            return;
        }

        await ballot.update({
            limitDate: new Date(),
            isSuspended: false
        });

        const updatedBallot = await Ballot.findByPk(ballotId);
        res.json(formatBallotResponse(updatedBallot));
    } catch (error: any) {
        console.error('Error ending ballot:', error);
        res.status(500).json({ message: 'Error ending ballot', error: error.message });
    }
};

export const unsuspendBallot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = Number(req.params.id);
        const ballot = await Ballot.findByPk(ballotId);

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Check if user is the admin of this ballot
        if (ballot.adminId !== req.user.id) {
            res.status(403).json({ message: 'Unauthorized to modify this ballot' });
            return;
        }

        // Check if ballot is suspended
        if (!ballot.isSuspended) {
            res.status(400).json({ message: 'Ballot is not suspended' });
            return;
        }

        if (ballot.timeLeft === null) {
            res.status(400).json({ message: 'Cannot unsuspend ballot: no time left information available' });
            return;
        }

        // Calculate new end date based on remaining time
        const now = new Date();
        const newEndDate = new Date(now.getTime() + (ballot.timeLeft * 1000));

        await ballot.update({
            isSuspended: false,
            timeLeft: null,
            limitDate: newEndDate
        });

        const updatedBallot = await Ballot.findByPk(ballotId);
        res.json(formatBallotResponse(updatedBallot));
    } catch (error: any) {
        console.error('Error unsuspending ballot:', error);
        res.status(500).json({ message: 'Error unsuspending ballot', error: error.message });
    }
};
