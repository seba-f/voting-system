import { Response } from 'express';
import { AuthRequest } from '../controllers/authController';
import Ballot from '../models/entities/voting/ballotModel';
import VotingOption from '../models/entities/voting/votingOptionsModel';
import CategoryRoles from '../models/entities/intermediary/categoryRolesModel';
import UserRoles from '../models/entities/intermediary/userRolesModel';
import Role from '../models/entities/user/roleModel';
import { Op, FindOptions } from 'sequelize';
import Vote from '../models/entities/voting/voteModel';

interface UserRoleWithRole extends UserRoles {
    Role?: {
        id: number;
        name: string;
    };
}

// Helper function to format ballot response
const formatBallotResponse = (ballot: any) => {
    const json = ballot.toJSON();
    const currentDate = new Date();
    const endDate = new Date(ballot.limitDate);

    let status;
    if (ballot.isSuspended) {
        status = 'Suspended';
    } else if (endDate < currentDate) {
        status = 'Ended';
    } else {
        status = 'Active';
    }

    return {
        ...json,
        type: json.ballotType, // Map ballotType to type for client compatibility
        endDate: ballot.limitDate.toISOString(),  // Format dates as ISO strings
        startDate: ballot.createdAt?.toISOString() || new Date().toISOString(),
        status // Add calculated status
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
        });        // Handle voting options based on ballot type
        if (ballotType === 'TEXT_INPUT') {
            // For text input ballots, create a single option
            await VotingOption.create({
                ballotId: ballot.id,
                title: 'Text Response',
                isText: true
            });
        } else if (ballotType === 'LINEAR_CHOICE') {
            // For linear choice ballots, create an option for each step value
            // Each option's title is in the format "value,label" for the endpoints
            const optionPromises = req.body.options.map(option => {
                return VotingOption.create({
                    ballotId: ballot.id,
                    title: option.title,  // Already formatted as "value,label" or just "value"
                    isText: false
                });
            });
            await Promise.all(optionPromises);
        } else {
            // For other ballot types, create the provided options
            const optionPromises = votingOptions.map(option => {
                return VotingOption.create({
                    ballotId: ballot.id,
                    title: option.text || option.title,  // Support both formats
                    isText: false
                });
            });
            await Promise.all(optionPromises);
        }

        res.status(201).json({ message: 'Ballot created successfully', ballot });
    } catch (error: any) {
        console.error('Error creating ballot:', error);
        res.status(500).json({ message: 'Error creating ballot', error: error.message });
    }
};

export const getActiveBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }        const currentDate = new Date();        // First try to establish associations if they don't exist
        try {
            await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        } catch (error) {
            console.log('[BallotsController] Association already exists or failed:', error);
        }

        // Get user's roles with Role information
        const userRoles = await UserRoles.findAll({
            where: {
                userId: req.user.id
            },
            include: [{
                model: Role,
                attributes: ['id', 'name']
            }]
        }) as unknown as UserRoleWithRole[];

        // Check if user has admin role by name
        const isAdmin = userRoles.some(ur => 
            ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin'
        );
        console.log('[BallotsController] User roles for admin check:', {
            userId: req.user.id,
            roles: userRoles.map(ur => ur.roleId),
            isAdmin
        });
        
        const queryOptions = {
            where: {
                limitDate: {
                    [Op.gt]: currentDate
                },
                isSuspended: false,
                ...(isAdmin ? {} : { /* Add any user-specific filters here */ })
            },
            include: [{
                model: VotingOption,
                attributes: ['id', 'title', 'isText']  // Only include necessary fields
            }],
            order: [['limitDate', 'ASC'] as [string, string]]  // Sort by nearest deadline first
        };

        const ballots = await Ballot.findAll(queryOptions);

        // Format each ballot before sending
        const formattedBallots = ballots.map(ballot => {
            const formatted = formatBallotResponse(ballot);
            return {
                ...formatted,
                status: formatted.isSuspended ? 'Suspended' : 
                        (new Date(formatted.endDate) < new Date() ? 'Ended' : 'Active')
            };
        });
        
        res.status(200).json(formattedBallots);
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

export const getActiveBallotsForUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            console.log('[BallotsController] Request received without authenticated user');
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const userId = req.params.userId;
        if (!userId) {
            console.log('[BallotsController] Request received without userId parameter');
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        console.log('[BallotsController] Processing request for user:', {
            userId,
            username: req.user.username
        });        // First try to establish associations if they don't exist
        try {
            await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        } catch (error) {
            console.log('[BallotsController] Association already exists or failed:', error);
        }

        // Get user's roles through the UserRoles model including Role information
        const userRoles = await UserRoles.findAll({
            where: {
                userId: userId
            },
            include: [{
                model: Role,
                attributes: ['id', 'name']
            }]
        }) as unknown as UserRoleWithRole[];

        console.log('[BallotsController] Found user roles:', userRoles.map(ur => ({
            roleId: ur.roleId,
            roleName: ur.Role?.name
        })));

        // Check if user is admin by role name
        const isAdmin = userRoles.some(ur => 
            ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin'
        );
        console.log('[BallotsController] User is admin:', isAdmin);

        const currentDate = new Date();

        if (isAdmin) {
            // If admin, return all active ballots
            const queryOptions: FindOptions = {
                where: {
                    limitDate: {
                        [Op.gt]: currentDate
                    },
                    isSuspended: false
                },
                include: [{
                    model: VotingOption,
                    attributes: ['id', 'title', 'isText']
                }],
                order: [['limitDate', 'ASC']]
            };

            const ballots = await Ballot.findAll(queryOptions);

            const formattedBallots = ballots.map(ballot => ({
                ...formatBallotResponse(ballot),
                status: 'Active'
            }));

            console.log('[BallotsController] Sending admin response with', formattedBallots.length, 'ballots');
            res.status(200).json(formattedBallots);
            return;
        }

        const userRoleIds = userRoles.map(ur => ur.roleId);

        // Get all category IDs that are associated with user's roles
        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            }
        });

        const allowedCategoryIds = categoryRoles.map(cr => cr.categoryId);
        console.log('[BallotsController] Allowed category IDs:', allowedCategoryIds);

        // Find all ballots that:
        // 1. Are not expired (limitDate > currentDate)
        // 2. Are not suspended
        // 3. Have a category that has a relation with any of the user's roles
        const queryOptions: FindOptions = {
            where: {
                limitDate: {
                    [Op.gt]: currentDate
                },
                isSuspended: false,
                categoryId: {
                    [Op.in]: allowedCategoryIds
                }
            },
            include: [
                {
                    model: VotingOption,
                    attributes: ['id', 'title', 'isText']
                }
            ],
            order: [['limitDate', 'ASC']]
        };

        console.log('[BallotsController] Query options:', JSON.stringify(queryOptions, null, 2));

        // Get filtered ballots
        const ballots = await Ballot.findAll(queryOptions);
        console.log('[BallotsController] Found ballots:', {
            count: ballots.length,
            ballots: ballots.map(b => ({ 
                id: b.id, 
                title: b.title, 
                categoryId: b.categoryId,
                limitDate: b.limitDate
            }))
        });

        // Format each ballot
        const formattedBallots = ballots.map(ballot => ({
            ...formatBallotResponse(ballot),
            status: 'Active'
        }));
        
        console.log('[BallotsController] Sending response with', formattedBallots.length, 'ballots');
        res.status(200).json(formattedBallots);
    } catch (error: any) {
        console.error('[BallotsController] Error fetching active ballots for user:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Error fetching active ballots', error: error.message });
    }
};

export const getUnvotedBallots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const currentDate = new Date();

        // First get user's roles
        const userRoles = await UserRoles.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['roleId']
        });

        const userRoleIds = userRoles.map(role => role.roleId);

        // Get categories that user has access to through their roles
        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            },
            attributes: ['categoryId']
        });

        const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);
        
        // Get all active ballots in categories user has access to
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

        // Get all ballots the user has voted on
        const votedBallotIds = await Vote.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['ballotId'],
            raw: true
        });

        const votedIds = votedBallotIds.map(vote => vote.ballotId);

        // Filter out ballots that user has already voted on
        const unvotedBallots = ballots.filter(ballot => !votedIds.includes(ballot.id));

        // Format ballots for response
        const formattedBallots = unvotedBallots.map(ballot => {
            const formatted = formatBallotResponse(ballot);
            return {
                ...formatted,
                status: formatted.isSuspended ? 'Suspended' : 
                        (new Date(formatted.endDate) < new Date() ? 'Ended' : 'Active')
            };
        });

        res.status(200).json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching unvoted ballots:', error);
        res.status(500).json({ message: 'Error fetching unvoted ballots', error: error.message });
    }
};

export const getBallot = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // First try to establish associations if they don't exist
        try {
            await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        } catch (error) {
            console.log('[BallotsController] Association already exists or failed:', error);
        }

        // Get user's roles with Role information
        const userRoles = await UserRoles.findAll({
            where: {
                userId: req.user.id
            },
            include: [{
                model: Role,
                attributes: ['id', 'name']
            }]
        }) as unknown as UserRoleWithRole[];

        // Check if user has admin role by name
        const isAdmin = userRoles.some(ur => 
            ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin'
        );

        console.log('[BallotsController] Fetching ballot:', {
            ballotId,
            userId: req.user.id,
            isAdmin,
            userRoles: userRoles.map(ur => ({ roleId: ur.roleId, roleName: ur.Role?.name }))
        });

        // If user is admin, fetch ballot without category restrictions
        let ballot;
        if (isAdmin) {
            ballot = await Ballot.findByPk(ballotId, {
                include: [{
                    model: VotingOption,
                    attributes: ['id', 'title', 'isText']
                }]
            });
        } else {
            // Get user's role IDs
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

            // Fetch the ballot with category restriction for non-admin users
            ballot = await Ballot.findOne({
                where: {
                    id: ballotId,
                    categoryId: {
                        [Op.in]: accessibleCategoryIds
                    }
                },
                include: [{
                    model: VotingOption,
                    attributes: ['id', 'title', 'isText']
                }]
            });
        }

        if (!ballot) {
            console.log('[BallotsController] Ballot not found or access denied:', {
                ballotId,
                userId: req.user.id,
                isAdmin
            });
            res.status(404).json({ message: 'Ballot not found or access denied' });
            return;
        }

        // Format and send the response
        const formattedBallot = {
            ...formatBallotResponse(ballot),
            options: ballot.VotingOptions
        };

        res.json(formattedBallot);
    } catch (error: any) {
        console.error('Error fetching ballot:', error);
        res.status(500).json({ message: 'Error fetching ballot', error: error.message });
    }
};

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
        }        // For multiple choice ballots, expect an array of optionIds
        // For text input ballots, expect textResponse
        const { optionId, optionIds, textResponse } = req.body;
        const selectedOptionIds = ballot.ballotType === 'MULTIPLE_CHOICE' ? optionIds : [optionId];

        if (!selectedOptionIds || !Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
            res.status(400).json({ message: 'No options selected' });
            return;
        }

        // Check if user has already voted on this ballot
        const existingVotes = await Vote.findAll({
            where: {
                userId: req.user.id,
                ballotId
            }
        });

        if (existingVotes.length > 0 && ballot.ballotType !== 'MULTIPLE_CHOICE') {
            res.status(400).json({ message: 'You have already voted on this ballot' });
            return;
        }

        // For multiple choice, clean up existing votes if any
        if (ballot.ballotType === 'MULTIPLE_CHOICE' && existingVotes.length > 0) {
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
        }        // Create votes
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

export const getVotedBallots = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Get all votes by the user
        const userVotes = await Vote.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['ballotId']
        });

        const votedBallotIds = userVotes.map(vote => vote.ballotId);

        // Get active ballots that user has voted on
        const ballots = await Ballot.findAll({
            where: {
                id: {
                    [Op.in]: votedBallotIds
                },
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

        const formattedBallots = ballots.map(ballot => ({
            ...formatBallotResponse(ballot),
            options: ballot.VotingOptions,
            status: ballot.isSuspended ? 'Suspended' : 
                    (new Date(ballot.limitDate) < new Date() ? 'Ended' : 'Active')
        }));

        res.status(200).json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching voted ballots:', error);
        res.status(500).json({ message: 'Error fetching voted ballots', error: error.message });
    }
};

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

export const getBallotAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const { id } = req.params;
        const ballot = await Ballot.findByPk(id, {
            include: [
                {
                    model: VotingOption,
                    attributes: ['id', 'title']
                }
            ]
        });

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Get category roles to determine eligible users
        const categoryRoles = await CategoryRoles.findAll({
            where: { categoryId: ballot.categoryId },
            attributes: ['roleId']
        });
        const eligibleRoleIds = categoryRoles.map(cr => cr.roleId);

        // Count eligible users (users with any of the eligible roles)
        const eligibleUsers = await UserRoles.count({
            where: {
                roleId: {
                    [Op.in]: eligibleRoleIds
                }
            },
            distinct: true,
            col: 'userId'
        });

        // Get all votes for this ballot
        const votes = await Vote.findAll({
            where: { ballotId: id },
            attributes: [
                'userId',
                'optionId',
                'timestamp'
            ]
        });

        // For ballots with no votes, return minimal analytics
        if (votes.length === 0) {
            const analytics = {
                totalVoters: 0,
                totalVotes: 0,
                eligibleUsers,
                participationRate: 0,
                choiceDistribution: ballot.VotingOptions.map(option => ({
                    optionId: option.id,
                    title: option.title,
                    votes: 0
                })),                hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
                    hour,
                    votes: 0
                })),
                ...(ballot.ballotType === 'TEXT_INPUT' ? { textResponses: [] } : {})
            };
            res.json(analytics);
            return;
        }

        // Count unique voters
        const uniqueVoters = new Set(votes.map(vote => vote.userId)).size;        // For text input ballots, get text responses
        let textResponses = [];
        if (ballot.ballotType === 'TEXT_INPUT') {
            const fullVotes = await Vote.findAll({
                where: { ballotId: id },
                attributes: ['textResponse']
            });
            textResponses = fullVotes.filter(v => v.textResponse).map(v => ({
                response: v.textResponse
            }));
        }

        // Calculate choice distribution (for non-text input ballots)
        let choiceDistribution = {};
        if (ballot.ballotType !== 'TEXT_INPUT' && ballot.ballotType !== 'RANKED_CHOICE') {
            choiceDistribution = votes.reduce((acc, vote) => {
                acc[vote.optionId] = (acc[vote.optionId] || 0) + 1;
                return acc;
            }, {});
        }

        // Calculate voting frequency per hour (using unique voters per hour for multiple choice)
        const hourlyDistribution = votes.reduce((acc, vote) => {
            const timestamp = new Date(vote.timestamp);
            const hour = timestamp.getHours();
            
            // For multiple choice, ensure we only count each user once per hour
            if (ballot.ballotType === 'MULTIPLE_CHOICE') {
                // Create a unique key for user and hour
                const userHourKey = `${vote.userId}-${hour}`;
                if (!acc.userTracking[userHourKey]) {
                    acc.userTracking[userHourKey] = true;
                    acc.distribution[hour] = (acc.distribution[hour] || 0) + 1;
                }
            } else {
                acc.distribution[hour] = (acc.distribution[hour] || 0) + 1;
            }
            return acc;
        }, { distribution: {}, userTracking: {} }).distribution;        // Format the response with full analytics
        const baseAnalytics = {
            totalVoters: uniqueVoters,
            totalVotes: votes.length,
            eligibleUsers,
            participationRate: uniqueVoters / eligibleUsers,
            hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                votes: hourlyDistribution[hour] || 0
            }))
        };

        // Add type-specific data
        const analytics = ballot.ballotType === 'TEXT_INPUT'
            ? {
                ...baseAnalytics,
                textResponses
            }
            : {
                ...baseAnalytics,
                choiceDistribution: ballot.VotingOptions.map(option => ({
                    optionId: option.id,
                    title: option.title,
                    votes: choiceDistribution[option.id] || 0
                }))
            }

        res.json(analytics);
    } catch (error: any) {
        console.error('Error fetching ballot analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching ballot analytics', 
            error: error.message 
        });
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

        const endDate = new Date(ballot.limitDate);
        if (endDate < new Date()) {
            res.status(400).json({ message: 'Cannot suspend an ended ballot' });
            return;
        }

        await ballot.update({
            isSuspended: true,
            suspensionDuration: ballot.suspensionDuration || 0
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

        // Check if ballot would be ended
        const endDate = new Date(ballot.limitDate);
        if (endDate < new Date()) {
            res.status(400).json({ message: 'Cannot unsuspend a ballot that has passed its end date' });
            return;
        }

        await ballot.update({
            isSuspended: false
        });

        const updatedBallot = await Ballot.findByPk(ballotId);
        res.json(formatBallotResponse(updatedBallot));
    } catch (error: any) {
        console.error('Error unsuspending ballot:', error);
        res.status(500).json({ message: 'Error unsuspending ballot', error: error.message });
    }
};

// Add more ballot-related controller functions here as needed
