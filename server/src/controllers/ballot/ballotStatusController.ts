import { Response } from 'express';
import { AuthRequest } from '../../controllers/authController';
import Ballot from '../../models/entities/voting/ballotModel';
import VotingOption from '../../models/entities/voting/votingOptionsModel';
import Vote from '../../models/entities/voting/voteModel';
import CategoryRoles from '../../models/entities/intermediary/categoryRolesModel';
import UserRoles from '../../models/entities/intermediary/userRolesModel';
import { Op } from 'sequelize';
import { formatBallotResponse } from './ballotHelpers';

// retrieve active ballots with user's voting status and permissions
export const getActiveBallotsWithVoteStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const currentDate = new Date();

        // Get user's roles
        const userRoles = await UserRoles.findAll({
            where: { userId: req.user.id },
            attributes: ['roleId']
        });
        const userRoleIds = userRoles.map(role => role.roleId);

        // Get categories user has access to
        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            },
            attributes: ['categoryId']
        });
        const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);

        // Get all active ballots
        const ballots = await Ballot.findAll({
            where: {
                limitDate: {
                    [Op.gt]: currentDate
                },
                isSuspended: false,
                categoryId: {
                    [Op.in]: accessibleCategoryIds
                }
            },
            include: [{
                model: VotingOption,
                attributes: ['id', 'title', 'isText']
            }]
        });

        // Get all votes by the user
        const userVotes = await Vote.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['ballotId']
        });

        const votedBallotIds = userVotes.map(vote => vote.ballotId);

        // Split ballots into voted and unvoted
        const votedBallots = [];
        const unvotedBallots = [];

        ballots.forEach(ballot => {
            const formattedBallot = {
                ...formatBallotResponse(ballot),
                options: ballot.VotingOptions,
                status: ballot.isSuspended ? 'Suspended' : 
                        (new Date(ballot.limitDate) < new Date() ? 'Ended' : 'Active'),
                hasVoted: votedBallotIds.includes(ballot.id)
            };

            if (votedBallotIds.includes(ballot.id)) {
                votedBallots.push(formattedBallot);
            } else {
                unvotedBallots.push(formattedBallot);
            }
        });

        res.status(200).json({
            voted: votedBallots,
            unvoted: unvotedBallots
        });
    } catch (error: any) {
        console.error('Error fetching ballots with vote status:', error);
        res.status(500).json({ message: 'Error fetching ballots', error: error.message });
    }
};

export const getPastBallotsWithVoteStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const currentDate = new Date();

        // Get user's roles
        const userRoles = await UserRoles.findAll({
            where: { userId: req.user.id },
            attributes: ['roleId']
        });
        const userRoleIds = userRoles.map(role => role.roleId);

        // Get categories user has access to
        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            },
            attributes: ['categoryId']
        });
        const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);

        // Get all past ballots
        const ballots = await Ballot.findAll({
            where: {
                limitDate: {
                    [Op.lt]: currentDate
                },
                isSuspended: false,
                categoryId: {
                    [Op.in]: accessibleCategoryIds
                }
            },
            include: [{
                model: VotingOption,
                attributes: ['id', 'title', 'isText']
            }]
        });

        // Get all votes by the user
        const userVotes = await Vote.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['ballotId']
        });

        const votedBallotIds = userVotes.map(vote => vote.ballotId);

        // Split ballots into voted and unvoted
        const votedBallots = [];
        const unvotedBallots = [];

        ballots.forEach(ballot => {
            const formattedBallot = {
                ...formatBallotResponse(ballot),
                options: ballot.VotingOptions,
                status: 'Ended',
                hasVoted: votedBallotIds.includes(ballot.id)
            };

            if (votedBallotIds.includes(ballot.id)) {
                votedBallots.push(formattedBallot);
            } else {
                unvotedBallots.push(formattedBallot);
            }
        });

        res.json({ voted: votedBallots, unvoted: unvotedBallots });
    } catch (error: any) {
        console.error('Error fetching past ballots with vote status:', error);
        res.status(500).json({ 
            message: 'Error fetching past ballots with vote status', 
            error: error.message 
        });
    }
};
