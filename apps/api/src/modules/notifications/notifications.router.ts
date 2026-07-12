import { Router } from 'express';
import { notificationController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/me/notifications', authenticate, notificationController.list);
router.put('/notifications/:id/read', authenticate, notificationController.markRead);
router.post('/notifications/read-all', authenticate, notificationController.markAllRead);

export { router as notificationRouter };
