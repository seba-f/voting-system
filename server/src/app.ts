import express, { json } from 'express';
import dotenv from 'dotenv';
import sequelize from './models/db';
import './models/entities'
import fs from 'fs';
import path from 'path';
import authRouter from './routes/authRouter';
import { Session, User } from './models/entities';

const app = express();

app.use(express.json());
app.use('/api',authRouter);

// Function to cleanup active sessions
const cleanupSessions = async () => {
    try {
        // Find all active sessions
        const activeSessions = await Session.findAll({
            where: { isActive: true }
        });

        // Update all active sessions and their users
        await Promise.all([
            Session.update(
                { isActive: false },
                { where: { isActive: true } }
            ),
            User.update(
                { isActive: false },
                { where: { isActive: true } }
            )
        ]);

        console.log(`Cleaned up ${activeSessions.length} active sessions`);
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

//init db
sequelize.sync({alter:true})
.then(async () => {
    console.log('Database connected successfully');
    console.log('Registered models: ', Object.keys(sequelize.models));
    
    // Clean up any sessions that might have been left active from previous run
    await cleanupSessions();
})
.then(result => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT,() => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Unable to connect to database: ',err);
});
