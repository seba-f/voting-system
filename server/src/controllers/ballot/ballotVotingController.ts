import { Response } from 'express';
import { AuthRequest } from '../../controllers/authController';
import Ballot from '../../models/entities/voting/ballotModel';
import VotingOption from '../../models/entities/voting/votingOptionsModel';
import Vote from '../../models/entities/voting/voteModel';
import UserRoles from '../../models/entities/intermediary/userRolesModel';
import CategoryRoles from '../../models/entities/intermediary/categoryRolesModel';
import { Op } from 'sequelize';
import { formatBallotResponse } from './ballotHelpers';

export const submitVote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = parseInt(req.params.id);
        if (isNaN(ballotId)) {
            res.status(400).json({ message: 'Invalid ballot ID' });
            return;
        }

        // Get user's roles and check access
        const userRoles = await UserRoles.findAll({
            where: { userId: req.user.id },
            attributes: ['roleId']
        });
        const userRoleIds = userRoles.map(role => role.roleId);

        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            },
            attributes: ['categoryId']
        });
        const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);

        // Fetch the ballot
        const ballot = await Ballot.findOne({
            where: {
                id: ballotId,
                categoryId: {
                    [Op.in]: accessibleCategoryIds
                },
                isSuspended: false,
                limitDate: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found, expired, or access denied' });
            return;
        }

        // Extract vote data based on ballot type
        const { optionId, optionIds, textResponse } = req.body;
        const selectedOptionIds = 
            ballot.ballotType === 'MULTIPLE_CHOICE' || ballot.ballotType === 'RANKED_CHOICE' 
                ? optionIds 
                : [optionId];

        if (!selectedOptionIds || !Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
            res.status(400).json({ message: 'No options selected' });
            return;
        }

        // For ranked choice, make sure all options are ranked
        if (ballot.ballotType === 'RANKED_CHOICE') {
            const allOptions = await VotingOption.findAll({
                where: { ballotId }
            });
            if (selectedOptionIds.length !== allOptions.length) {
                res.status(400).json({ message: 'All options must be ranked' });
                return;
            }
        }

        // Check if user has already voted on this ballot
        const existingVotes = await Vote.findAll({
            where: {
                userId: req.user.id,
                ballotId
            }
        });

        const allowMultipleVotes = ballot.ballotType === 'MULTIPLE_CHOICE' || ballot.ballotType === 'RANKED_CHOICE';
        if (existingVotes.length > 0 && !allowMultipleVotes) {
            res.status(400).json({ message: 'You have already voted on this ballot' });
            return;
        }

        // Clean up existing votes if necessary
        if (allowMultipleVotes && existingVotes.length > 0) {
            await Vote.destroy({
                where: {
                    userId: req.user.id,
                    ballotId
                }
            });
        }

        // Verify all options exist and belong to this ballot
        const options = await VotingOption.findAll({
            where: {
                id: {
                    [Op.in]: selectedOptionIds
                },
                ballotId
            }
        });

        if (options.length !== selectedOptionIds.length) {
            res.status(400).json({ message: 'One or more invalid voting options' });
            return;
        }

        // Create votes
        let votes;
        if (ballot.ballotType === 'TEXT_INPUT') {
            // For text input, create a single vote with the text response
            votes = [await Vote.create({
                userId: req.user.id,
                ballotId,
                optionId: selectedOptionIds[0],
                textResponse: textResponse,
                timestamp: new Date()
            })];
        } else if (ballot.ballotType === 'RANKED_CHOICE') {
            // For ranked choice, create votes with timestamps in order to track rank
            votes = await Promise.all(selectedOptionIds.map((optionId, index) => 
                Vote.create({
                    userId: req.user.id,
                    ballotId,
                    optionId,
                    timestamp: new Date(Date.now() + index) // Add index to timestamp to preserve order
                })
            ));
        } else {
            // For other ballot types, create votes without text response
            votes = await Promise.all(selectedOptionIds.map(optionId =>
                Vote.create({
                    userId: req.user.id,
                    ballotId,
                    optionId,
                    timestamp: new Date()
                })
            ));
        }

        // Format response based on ballot type
        const response = ballot.ballotType === 'MULTIPLE_CHOICE' ? votes : votes[0];
        res.status(201).json(response);
    } catch (error: any) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ message: 'Error submitting vote', error: error.message });
    }
};

export const getVote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = parseInt(req.params.id);
        if (isNaN(ballotId)) {
            res.status(400).json({ message: 'Invalid ballot ID' });
            return;
        }

        // Get ballot type to determine response format
        const ballot = await Ballot.findByPk(ballotId);
        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Get user's vote(s)
        const votes = await Vote.findAll({
            where: {
                userId: req.user.id,
                ballotId
            }
        });

        if (votes.length === 0) {
            res.status(404).json({ message: 'No vote found' });
            return;
        }

        // For multiple choice, return all votes. For others, return just the first vote
        res.json(ballot.ballotType === 'MULTIPLE_CHOICE' ? votes : votes[0]);
    } catch (error: any) {
        console.error('Error fetching vote:', error);
        res.status(500).json({ message: 'Error fetching vote', error: error.message });
    }
};

export const getUserVote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const ballotId = parseInt(req.params.id);
        if (isNaN(ballotId)) {
            res.status(400).json({ message: 'Invalid ballot ID' });
            return;
        }

        // First get the ballot to check its type
        const ballot = await Ballot.findByPk(ballotId);
        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Get all user's votes for this ballot
        const votes = await Vote.findAll({
            where: {
                userId: req.user.id,
                ballotId
            },
            include: [{
                model: VotingOption,
                attributes: ['id', 'title']
            }]
        });

        if (votes.length === 0) {
            res.status(404).json({ message: 'Vote not found' });
            return;
        }

        // For multiple choice ballots, return all votes
        // For other ballot types, return just the first vote
        res.status(200).json(
            ballot.ballotType === 'MULTIPLE_CHOICE' ? votes : votes[0]
        );
    } catch (error: any) {
        console.error('Error fetching user vote:', error);
        res.status(500).json({ message: 'Error fetching user vote', error: error.message });
    }
};
