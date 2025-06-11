import { Request, Response } from 'express';
import { Role } from '../models/entities';

/**
 * Get all roles
 */
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        const roles = await Role.findAll({
            attributes: ['id', 'name']
        });

        res.status(200).json({ roles });
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ 
            message: 'Error fetching roles',
            error: err.message 
        });
    }
};

/**
 * Create a new role
 */
export const createRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Role name is required' });
            return;
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            res.status(400).json({ message: 'Role already exists' });
            return;
        }

        const role = await Role.create({ name });

        res.status(201).json({
            message: 'Role created successfully',
            role: {
                id: role.id,
                name: role.name
            }
        });
    } catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ 
            message: 'Error creating role',
            error: err.message 
        });
    }
};