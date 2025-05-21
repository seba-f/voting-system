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

export const login=async (req:Request, res:Response): Promise<void>=>{
    try{
        const {email,password}=req.body;
        const user = await User.findOne({where:{email}});
        if(!user){
            res.status(401).json({message:'User does not exist'});
            return;
        }
        const isValidPassword=await bcrypt.compare(password,user.password);
        if(!isValidPassword){
            res.status(401).json({message:'Incorrect password'});
            return;
        }
        const token=jwt.sign({
            id:user.id,
            email:user.email
        },
            process.env.JWT_SECRET,
        {expiresIn:'1h'});

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // now + 1 hour
        const session = await Session.create({
            userId: user.id,
            token: token,
            expiresAt: expiresAt,
            isActive: true,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || ''
        });
        res.status(200).json({
            nessage: 'Login successful',
            token
        });
    } catch(err){
        console.error('Login error: ', err);
        res.status(500).json({message: 'Error during login'});
    }
}

export const logout=async(req:Request,res:Response):Promise<void>=>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const session = await Session.findOne({ where: { token, isActive: true } });
        if (!session) {
            res.status(401).json({ message: 'Invalid session or already logged out' });
            return;
        }
        session.isActive = false;
        await session.save();
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error: ', err);
        res.status(500).json({ message: 'Error during logout' });
    }
}