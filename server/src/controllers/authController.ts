/**
 * Authentication Controller
 * 
 * Handles user authentication, session management, and authorization.
 */

import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { JWT_EXPIRY, SESSION_DURATION_MS } from '../config/sessionConfig';
import Role from '../models/entities/user/roleModel';
import Session from '../models/entities/user/sessionModel';
import User from '../models/entities/user/userModel';
import UserRoles from '../models/entities/intermediary/userRolesModel';

/**
 * Creates a default admin user for initial system setup
 * Should only be used in development or initial deployment
 */
export const registerDefaultAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        // Create admin role
        const [role] = await Role.findOrCreate({
            where: { name: 'DefaultAdmin' },
            defaults: {
                name: 'DefaultAdmin'
            }
        });

        // Create admin user with default credentials
        const hashedPassword = await bcrypt.hash('pass', 10);
        const user = await User.create({
            email: 'admin@example.com',
            password: hashedPassword,
            username: 'admin',
            isActive: true
        });

        // Link user to admin role
        await UserRoles.create({
            userId: user.id,
            roleId: role.id
        });

        res.status(201).json({
            message: 'Default admin registered successfully',
            userId: user.id
        });

    } catch (err) {
        console.error('Registration error: ', err);
        res.status(500).json({
            message: 'Error registering default admin',
            error: err.message
        });
    }
}

/**
 * Handles user authentication and session creation
 * @param req.body.email - User's email
 * @param req.body.password - User's password (plain text)
 * @returns User data and session token on success
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({ 
            where: { email },
            attributes: ['id', 'email', 'password', 'username'],
            include: [{
                model: Role,
                through: { attributes: [] },
                attributes: ['name']
            }]
        });

        if (!user) {
            res.status(401).json({ message: 'User does not exist' });
            return;
        }

        if (!user.password) {
            res.status(500).json({ message: 'User password is missing' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: JWT_EXPIRY }
        );

        // Deactivate old sessions
        await Session.update(
            { isActive: false },
            { where: { userId: user.id, isActive: true } }
        );

        // Create new session
        const expireAt = new Date(Date.now() + SESSION_DURATION_MS);
        await Session.create({
            userId: user.id,
            token,
            isActive: true,
            expiresAt: expireAt,
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown'
        });

        user.isActive = true;
        await user.save();

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.get('Roles')
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            message: 'Error during login',
            error: err.message 
        });
    }
};

/**
 * Updates a user's active status based on their active session count
 */
const updateUserActiveStatus = async (userId: number) => {
    const activeSessionCount = await Session.count({
        where: { 
            userId,
            isActive: true,
            expiresAt: {
                [Op.gt]: new Date()  // Only count non-expired sessions
            }
        }
    });
    
    const user = await User.findByPk(userId);
    if (user) {
        user.isActive = activeSessionCount > 0;
        await user.save();
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        console.log('header: ',authHeader)
        const token = authHeader.split(' ')[1];
        console.log('token: ',token);
        
        // Deactivate session
        const session = await Session.findOne({ 
            where: { token }
        });
        console.log('session: ',session);
        if (session) {
            session.isActive = false;
            await session.save();

            // Update user's active status
            await updateUserActiveStatus(session.userId);
        }

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Error during logout' });
    }
};

/**
 * Cleanup expired sessions and update user status
 */
const cleanupExpiredSessions = async (userId: number) => {
    // Get all expired but still active sessions for the user
    const expiredSessions = await Session.findAll({
        where: {
            userId,
            isActive: true,
            expiresAt: {
                [Op.lte]: new Date()
            }
        }
    });

    // Mark expired sessions as inactive
    if (expiredSessions.length > 0) {
        await Promise.all(expiredSessions.map(session => {
            session.isActive = false;
            return session.save();
        }));

        // Update user's active status based on remaining active sessions
        await updateUserActiveStatus(userId);
    }
};

export const extendSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        
        const oldToken = authHeader.split(' ')[1];
        const session = await Session.findOne({ 
            where: { token: oldToken, isActive: true }
        });

        if (!session) {
            res.status(401).json({ message: 'Invalid session' });
            return;
        }

        // Clean up any expired sessions for this user
        await cleanupExpiredSessions(session.userId);

        // If the current session is expired, don't allow extension
        if (session.expiresAt < new Date()) {
            session.isActive = false;
            await session.save();
            await updateUserActiveStatus(session.userId);
            res.status(401).json({ message: 'Session has expired' });
            return;
        }

        const newToken = jwt.sign(
            {
                id: session.userId,
                email: (await User.findByPk(session.userId))?.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: JWT_EXPIRY }
        );        // Update session with new expiry and token
        const expireAt = new Date(Date.now() + SESSION_DURATION_MS);
        await Session.update(
            {
                token: newToken,
                expiresAt: expireAt,
                isActive: true
            },
            {
                where: { id: session.id }
            }
        );

        res.status(200).json({ token: newToken });
    } catch (err) {
        console.error('Session extension error:', err);
        res.status(500).json({ message: 'Error extending session' });
    }
};