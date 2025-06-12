import { Router } from 'express';
import { updateSessionActiveStatus } from '../controllers/sessionController';

const router = Router();

// Update session active status
router.put('/active-status', updateSessionActiveStatus);

export default router;
