import express from 'express';
import { getAllUsers, createUser, deleteUser } from '../controllers/usersController';

const router = express.Router();

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id',deleteUser);

export default router;