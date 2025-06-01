import express from 'express';
import {registerDefaultAdmin, login, logout} from '../controllers/authController';

const router = express.Router();

router.post('/register-admin',registerDefaultAdmin);//dev-only route to create initial admin
router.post('/login', login);
router.post('/logout',logout);

export default router;