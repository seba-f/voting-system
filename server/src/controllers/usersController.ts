import { Request, Response } from 'express';
import { User, Role, UserRoles } from '../models/entities';
import bcrypt from 'bcrypt';

/**
 * Get all users with their roles
 * Excludes sensitive information like passwords
 */
// retrieve all users with their assigned roles, excluding sensitive data
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'username', 'isActive'],
            include: [{
                model: Role,
                through: { attributes: [] }, // Don't include junction table fields
                attributes: ['name']
            }]
        });

        res.status(200).json({
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                username: user.username,
                isActive: user.isActive,
                roles: user.get('Roles')
            }))
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: err.message 
        });
    }
};

/**
 * Create a new user with specified roles
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, roleIds } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Username, email and password are required' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            isActive: false
        });

        // Assign roles if provided
        if (roleIds && Array.isArray(roleIds)) {
            await Promise.all(
                roleIds.map(roleId => 
                    UserRoles.create({
                        userId: user.id,
                        roleId
                    })
                )
            );
        }

        // Fetch the created user with roles for response
        const userWithRoles = await User.findOne({
            where: { id: user.id },
            attributes: ['id', 'email', 'username', 'isActive'],
            include: [{
                model: Role,
                through: { attributes: [] },
                attributes: ['name']
            }]
        });

        res.status(201).json({
            message: 'User created successfully',
            user: userWithRoles
        });

    } catch (err: any) {
        console.error('Error creating user:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Email is already in use' });
        } else {
            res.status(500).json({ 
                message: 'Error creating user',
                error: err.message 
            });
        }
    }
};

export const deleteUser = async(req: Request, res: Response): Promise<void>=>{
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await user.destroy();
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ 
            message: 'Error deleting user',
            error: err.message 
        });
    }
};

/**
 * Update user's active status
 */
export const updateUserActiveStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({ 
            message: 'User active status updated successfully',
            user: {
                id: user.id,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error('Error updating user active status:', err);
        res.status(500).json({ 
            message: 'Error updating user active status',
            error: err.message 
        });
    }
};

/**
 * Update user details and roles
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { username, roleIds } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update username if provided
        if (username) {
            user.username = username;
            await user.save();
        }

        // Update roles if provided
        if (roleIds && Array.isArray(roleIds)) {
            // Remove all current roles
            await UserRoles.destroy({
                where: { userId: id }
            });

            // Add new roles
            await Promise.all(
                roleIds.map(roleId => 
                    UserRoles.create({
                        userId: user.id,
                        roleId
                    })
                )
            );
        }

        // Fetch updated user with roles
        const updatedUser = await User.findOne({
            where: { id },
            attributes: ['id', 'email', 'username', 'isActive'],
            include: [{
                model: Role,
                through: { attributes: [] },
                attributes: ['id', 'name']
            }]
        });

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ 
            message: 'Error updating user',
            error: err.message 
        });
    }
};