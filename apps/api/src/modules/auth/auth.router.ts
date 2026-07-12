import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);

export { router as authRouter };
