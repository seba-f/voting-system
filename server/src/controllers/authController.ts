import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { Role, Session, User, UserRoles } from "../models/entities";
import sequelize from "../models/db";
import { QueryTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

export const registerDefaultAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        // Create admin role
        const [role] = await Role.findOrCreate({
            where: { name: 'DefaultAdmin' },
            defaults: {
                name: 'DefaultAdmin'
            }
        });

        // Create admin user
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

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        //find user with roles
        const user = await User.findOne({ 
            where: { email },
            attributes: ['id', 'email', 'password','username'],
            include:[{
                model:Role,
                through:{attributes:[]},
                attributes:['name']
            }]
        });

        if (!user) {
            res.status(401).json({ message: 'User does not exist' });
            return;
        }

        // Check for existing active session
        const existingSession = await Session.findOne({
            where: { 
                userId: user.id,
                isActive: true
            }
        });

        if (existingSession) {
            res.status(400).json({ message: 'User already logged in' });
            return;
        }

        if (!user.password) {
            console.error('User password hash is missing');
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password.trim());

        if (!isValidPassword) {
            res.status(401).json({ message: 'Incorrect password' });
            return;
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create new active session
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await Session.create({
            userId: user.id,
            token: token,
            expiresAt: expiresAt,
            isActive: true,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || ''
        });

        user.isActive=true;
        await user.save();

        const userData={
            id:user.id,
            email:user.email,
            username:user.username,
            roles:user.get('Roles')
        };

        res.status(200).json({
            message: 'Login successful',
            token,
            user:userData
        });
    } catch(err) {
        console.error('Login error: ', err);
        res.status(500).json({ message: 'Error during login' });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        
        const token = authHeader.split(' ')[1];
        const session = await Session.findOne({ 
            where: { token, isActive: true }
        });

        if (!session) {
            res.status(401).json({ message: 'Invalid session or already logged out' });
            return;
        }

        // Update session
        session.isActive = false;
        await session.save();

        // Update user's active status using the userId from session
        const user = await User.findByPk(session.userId);
        if (user) {
            user.isActive = false;
            await user.save();
        }

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error: ', err);
        res.status(500).json({ message: 'Error during logout' });
    }
}