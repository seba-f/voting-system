import express, { json } from 'express';
import dotenv from 'dotenv';
import sequelize from './models/db';
import './models/entities'
import fs from 'fs';
import path from 'path';
import authRouter from './routes/authRouter';
import usersRouter from './routes/usersRouter';
import rolesRouter from './routes/rolesRouter';
import { Session, User } from './models/entities';
import cors from 'cors';
import { Op } from 'sequelize';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'app://voting-system'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', rolesRouter);

// Function to cleanup invalid sessions on server start
const cleanupSessions = async () => {
    try {
        // In development, keep sessions for easier testing
        if (process.env.NODE_ENV === 'development') {
            return;
        }

        // Only cleanup obviously invalid sessions (null tokens, etc)
        const invalidSessions = await Session.findAll({
            where: { 
                [Op.or]: [
                    { token: null },
                    { expiresAt: null }
                ]
            }
        });

        if (invalidSessions.length > 0) {
            await Session.destroy({
                where: {
                    id: invalidSessions.map(s => s.id)
                }
            });
            console.log(`Cleaned up ${invalidSessions.length} invalid sessions`);
        }
    } catch (err) {
        console.error('Error cleaning up sessions:', err);
    }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
    console.log('Starting graceful shutdown...');
    await cleanupSessions();
    process.exit(0);
};

// Register cleanup handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

//init db and start server
const initializeApp = async () => {
    try {
        // First, just test the connection
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        await sequelize.sync({alter:true});

        // Clean up sessions regardless of mode
        await cleanupSessions();

        // Start server after successful database initialization
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize application:', err);
        process.exit(1);
    }
};

initializeApp();
