import express from 'express';
import { getAllUsers, createUser, deleteUser, updateUserActiveStatus, updateUser } from '../controllers/usersController';

const router = express.Router();

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/active-status', updateUserActiveStatus);
router.put('/users/:id', updateUser);

export default router;