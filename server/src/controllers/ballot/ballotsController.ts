import { Response } from 'express';
import { AuthRequest } from '../../controllers/authController';
import Ballot from '../../models/entities/voting/ballotModel';
import VotingOption from '../../models/entities/voting/votingOptionsModel';
import CategoryRoles from '../../models/entities/intermediary/categoryRolesModel';
import UserRoles from '../../models/entities/intermediary/userRolesModel';
import Role from '../../models/entities/user/roleModel';
import { Op, FindOptions } from 'sequelize';
import { formatBallotResponse, UserRoleWithRole } from './ballotHelpers';
import Vote from '../../models/entities/voting/voteModel';

// create new ballot with options, roles, and category assignments
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
            timeLeft: null
        });

        // Handle voting options based on ballot type
        if (ballotType === 'TEXT_INPUT') {
            // For text input ballots, create a single option
            await VotingOption.create({
                ballotId: ballot.id,
                title: 'Text Response',
                isText: true
            });
        } else if (ballotType === 'LINEAR_CHOICE') {
            // For linear choice ballots, create an option for each step value
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

export const getActiveBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const currentDate = new Date();

        try {
            await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        } catch (error) {
            console.log('[BallotsController] Association already exists or failed:', error);
        }

        const userRoles = await UserRoles.findAll({
            where: {
                userId: req.user.id
            },
            include: [{
                model: Role,
                attributes: ['id', 'name']
            }]
        }) as unknown as UserRoleWithRole[];

        const isAdmin = userRoles.some(ur => 
            ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin'
        );
        
        const queryOptions = {
            where: {
                limitDate: {
                    [Op.gt]: currentDate
                },
                isSuspended: false,
                ...(isAdmin ? {} : {})
            },
            include: [{
                model: VotingOption,
                attributes: ['id', 'title', 'isText']
            }],
            order: [['limitDate', 'ASC'] as [string, string]]
        };

        const ballots = await Ballot.findAll(queryOptions);

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
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Get user's roles with Role information
        await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        const userRoles = await UserRoles.findAll({
            where: { userId: req.user.id },
            include: [{ model: Role, attributes: ['id', 'name'] }]
        }) as unknown as UserRoleWithRole[];

        // Check if user is admin
        const isAdmin = userRoles.some(ur => ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin');
        const currentDate = new Date();
        let ballots;
        if (isAdmin) {
            // Admin: fetch all past ballots
            ballots = await Ballot.findAll({
                where: {
                    limitDate: { [Op.lt]: currentDate },
                    isSuspended: false
                },
                include: [VotingOption]
            });
        } else {
            // Non-admin: filter by accessible categories
            const userRoleIds = userRoles.map(role => role.roleId);
            const categoryRoles = await CategoryRoles.findAll({
                where: { roleId: { [Op.in]: userRoleIds } },
                attributes: ['categoryId']
            });
            const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);
            ballots = await Ballot.findAll({
                where: {
                    limitDate: { [Op.lt]: currentDate },
                    isSuspended: false,
                    categoryId: { [Op.in]: accessibleCategoryIds }
                },
                include: [VotingOption]
            });
        }
        const formattedBallots = ballots.map(formatBallotResponse);
        res.json(formattedBallots);
    } catch (error: any) {
        console.error('Error fetching past ballots:', error);
        res.status(500).json({ message: 'Error fetching past ballots', error: error.message });
    }
};

export const getSuspendedBallotsForCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        const userRoles = await UserRoles.findAll({
            where: { userId: req.user.id },
            include: [{ model: Role, attributes: ['id', 'name'] }]
        }) as unknown as UserRoleWithRole[];
        const isAdmin = userRoles.some(ur => ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin');
        let ballots;
        if (isAdmin) {
            ballots = await Ballot.findAll({
                where: { isSuspended: true },
                include: [VotingOption]
            });
        } else {
            const userRoleIds = userRoles.map(role => role.roleId);
            const categoryRoles = await CategoryRoles.findAll({
                where: { roleId: { [Op.in]: userRoleIds } },
                attributes: ['categoryId']
            });
            const accessibleCategoryIds = categoryRoles.map(cr => cr.categoryId);
            ballots = await Ballot.findAll({
                where: {
                    isSuspended: true,
                    categoryId: { [Op.in]: accessibleCategoryIds }
                },
                include: [VotingOption]
            });
        }
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
        });

        try {
            await UserRoles.belongsTo(Role, { foreignKey: 'roleId' });
        } catch (error) {
            console.log('[BallotsController] Association already exists or failed:', error);
        }

        const userRoles = await UserRoles.findAll({
            where: {
                userId: userId
            },
            include: [{
                model: Role,
                attributes: ['id', 'name']
            }]
        }) as unknown as UserRoleWithRole[];

        const isAdmin = userRoles.some(ur => 
            ur.Role?.name === 'admin' || ur.Role?.name === 'DefaultAdmin'
        );

        const currentDate = new Date();

        if (isAdmin) {
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

            res.status(200).json(formattedBallots);
            return;
        }

        const userRoleIds = userRoles.map(ur => ur.roleId);

        const categoryRoles = await CategoryRoles.findAll({
            where: {
                roleId: {
                    [Op.in]: userRoleIds
                }
            }
        });

        const allowedCategoryIds = categoryRoles.map(cr => cr.categoryId);

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
