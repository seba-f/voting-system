import { Request, Response } from 'express';
import { Category, Role, Ballot, CategoryRoles } from '../models/entities';

interface BallotInstance {
    id: number;
    title: string;
    isSuspended: boolean;
    limitDate: Date;
}

/**
 * Get all categories with their roles and ballots
 */
// retrieve all ballot categories with associated roles and ballots
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['name']
                },
                {
                    model: Ballot,
                    attributes: ['id', 'title', 'isSuspended', 'limitDate']
                }
            ]
        });

        res.status(200).json({
            categories: categories.map(category => ({
                id: category.id,
                name: category.name,
                roles: category.get('Roles'),
                ballots: (category.get('Ballots') as BallotInstance[]).map(ballot => ({
                    id: ballot.id,
                    title: ballot.title,
                    status: ballot.isSuspended ? 'Suspended' : new Date(ballot.limitDate) > new Date() ? 'Active' : 'Ended'
                }))
            }))
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ 
            message: 'Error fetching categories',
            error: err.message 
        });
    }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, roleIds } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Category name is required' });
            return;
        }

        // Create category
        const category = await Category.create({
            name
        });

        // Assign roles if provided
        if (roleIds && Array.isArray(roleIds)) {
            await Promise.all(
                roleIds.map(roleId => 
                    CategoryRoles.create({
                        categoryId: category.id,
                        roleId
                    })
                )
            );
        }

        // Fetch the created category with roles for response
        const categoryWithRoles = await Category.findOne({
            where: { id: category.id },
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['name']
                },
                {
                    model: Ballot,
                    attributes: ['id', 'title', 'isSuspended', 'limitDate']
                }
            ]
        });

        res.status(201).json({
            message: 'Category created successfully',
            category: {
                id: categoryWithRoles.id,
                name: categoryWithRoles.name,
                roles: categoryWithRoles.get('Roles'),
                ballots: (categoryWithRoles.get('Ballots') as BallotInstance[]).map(ballot => ({
                    id: ballot.id,
                    title: ballot.title,
                    status: ballot.isSuspended ? 'Suspended' : new Date(ballot.limitDate) > new Date() ? 'Active' : 'Ended'
                }))
            }
        });
    } catch (err: any) {
        console.error('Error creating category:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Category name must be unique' });
        } else {
            res.status(500).json({ 
                message: 'Error creating category',
                error: err.message 
            });
        }
    }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const category = await Category.findByPk(id);
        
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ 
            message: 'Error deleting category',
            error: err.message 
        });
    }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, roleIds } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Category name is required' });
            return;
        }

        // Update category name
        await Category.update({ name }, { where: { id } });

        // Update roles
        if (roleIds && Array.isArray(roleIds)) {
            // Remove existing role associations
            await CategoryRoles.destroy({ where: { categoryId: id } });
            
            // Add new role associations
            await Promise.all(
                roleIds.map(roleId => 
                    CategoryRoles.create({
                        categoryId: parseInt(id),
                        roleId
                    })
                )
            );
        }

        // Fetch updated category with roles for response
        const updatedCategory = await Category.findOne({
            where: { id },
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['name']
                },
                {
                    model: Ballot,
                    attributes: ['id', 'title', 'isSuspended', 'limitDate']
                }
            ]
        });

        res.status(200).json({
            message: 'Category updated successfully',
            category: {
                id: updatedCategory.id,
                name: updatedCategory.name,
                roles: updatedCategory.get('Roles'),
                ballots: (updatedCategory.get('Ballots') as BallotInstance[]).map(ballot => ({
                    id: ballot.id,
                    title: ballot.title,
                    status: ballot.isSuspended ? 'Suspended' : new Date(ballot.limitDate) > new Date() ? 'Active' : 'Ended'
                }))
            }
        });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ 
            message: 'Error updating category',
            error: err.message 
        });
    }
};
