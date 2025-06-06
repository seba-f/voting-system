/**
 * Authentication Router
 * 
 * Handles all authentication-related routes including:
 * - Login (/login)
 * - Logout (/logout)
 * - Session extension (/extend-session)
 * - Default admin registration (development only)
 */

import express from 'express';
import { registerDefaultAdmin, login, logout, extendSession } from '../controllers/authController';

const router = express.Router();

// Development route for initial setup
router.post('/register-admin', registerDefaultAdmin);

// Authentication routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/extend-session', extendSession);

export default router;