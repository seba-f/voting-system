import express from 'express';
import { getAllRoles, createRole } from '../controllers/rolesController';

const router = express.Router();

// Role management routes
router.get('/roles', getAllRoles);
router.post('/roles', createRole);

export default router;