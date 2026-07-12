import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/admin/stats', authenticate, authorize('ADMIN'), adminController.stats);
router.get('/admin/recent-activity', authenticate, authorize('ADMIN'), adminController.recentActivity);
router.get('/admin/users', authenticate, authorize('ADMIN'), adminController.users);
router.get('/admin/students', authenticate, authorize('ADMIN'), adminController.students);

export { router as adminRouter };
