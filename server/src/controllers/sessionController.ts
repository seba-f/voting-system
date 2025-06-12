import { Request, Response } from 'express';
import { Session } from '../models/entities';

export const updateSessionActiveStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { isActive } = req.body;
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        await Session.update(
            { isActive },
            { where: { token } }
        );

        res.status(200).json({ message: 'Session status updated successfully' });
    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({ message: 'Error updating session status' });
    }
};
