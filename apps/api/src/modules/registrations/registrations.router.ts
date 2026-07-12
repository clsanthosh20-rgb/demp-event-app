import { Router } from 'express';
import { registrationController } from './registrations.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/me/registrations', authenticate, registrationController.myRegistrations);
router.post('/events/:id/register', authenticate, registrationController.register);
router.post('/registrations/check-in', authenticate, authorize('ADMIN'), registrationController.checkIn);
router.get('/registrations/verify/:code', authenticate, authorize('ADMIN'), registrationController.verify);
router.delete('/registrations/:id', authenticate, authorize('ADMIN'), registrationController.removeRegistration);

export { router as registrationRouter };
