import { Response } from 'express';
import { AuthRequest } from '../controllers/authController';
import Ballot from '../models/entities/voting/ballotModel';
import VotingOption from '../models/entities/voting/votingOptionsModel';
import { Op } from 'sequelize';

// Helper function to format ballot response
const formatBallotResponse = (ballot: any) => {
    const json = ballot.toJSON();
    return {
        ...json,
        type: json.ballotType, // Map ballotType to type for client compatibility
        endDate: ballot.limitDate.toISOString(),  // Format dates as ISO strings
        startDate: ballot.createdAt?.toISOString() || new Date().toISOString()
    };
};

export const createBallot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, categoryId, limitDate, votingOptions, ballotType } = req.body;
        
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Create the ballot
        const ballot = await Ballot.create({
            title,
            description,
            categoryId,
            limitDate,
            ballotType,
            adminId: req.user.id,
            isSuspended: false,
            suspensionDuration: 0
        });

        // Create the voting options
        const optionPromises = votingOptions.map(option => {
            return VotingOption.create({
                ballotId: ballot.id,
                title: option.text,
                isText: false  // Since these are predefined options
            });
        });

        await Promise.all(optionPromises);

        res.status(201).json({ message: 'Ballot created successfully', ballot });
    } catch (error: any) {
        console.error('Error creating ballot:', error);
        res.status(500).json({ message: 'Error creating ballot', error: error.message });
    }
};

export const getActiveBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        const ballots = await Ballot.findAll({
            where: {
                limitDate: {
                    [Op.gt]: currentDate
                },
                isSuspended: false
            },
            include: [VotingOption]
        });

        // Format each ballot before sending
        const formattedBallots = ballots.map(formatBallotResponse);
        res.json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching active ballots:', error);
        res.status(500).json({ message: 'Error fetching active ballots', error: error.message });
    }
};

export const getPastBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        const ballots = await Ballot.findAll({
            where: {
                limitDate: {
                    [Op.lt]: currentDate
                },
                isSuspended: false
            },
            include: [VotingOption]
        });

        // Format each ballot before sending
        const formattedBallots = ballots.map(formatBallotResponse);
        res.json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching past ballots:', error);
        res.status(500).json({ message: 'Error fetching past ballots', error: error.message });
    }
};

export const getSuspendedBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ballots = await Ballot.findAll({
            where: {
                isSuspended: true
            },
            include: [VotingOption]
        });

        // Format each ballot before sending
        const formattedBallots = ballots.map(formatBallotResponse);
        res.json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching suspended ballots:', error);
        res.status(500).json({ message: 'Error fetching suspended ballots', error: error.message });
    }
};

// Add more ballot-related controller functions here as needed
