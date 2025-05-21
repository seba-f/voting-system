import express from 'express';
import {registerDefaultAdmin} from '../controllers/authController';

const router = express.Router();

//dev-only route to create initial admin
router.post('/register-admin',registerDefaultAdmin);

export default router;