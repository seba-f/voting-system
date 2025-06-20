import { Response } from 'express';
import { AuthRequest } from '../controllers/authController';
import Ballot from '../models/entities/voting/ballotModel';
import VotingOption from '../models/entities/voting/votingOptionsModel';
import CategoryRoles from '../models/entities/intermediary/categoryRolesModel';
import UserRoles from '../models/entities/intermediary/userRolesModel';
import Role from '../models/entities/user/roleModel';
import { Op, FindOptions } from 'sequelize';

interface UserRoleWithRole extends UserRoles {
    Role?: {
        id: number;
        name: string;
    };
}

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

// Add more ballot-related controller functions here as needed
