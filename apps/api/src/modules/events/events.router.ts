import { Router } from 'express';
import { eventsController } from './events.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/', eventsController.list);
router.post('/bulk-status', authenticate, authorize('ADMIN'), eventsController.bulkUpdateStatus);
router.get('/:id', eventsController.getById);
router.get('/:id/registrations', authenticate, authorize('ADMIN'), eventsController.getRegistrations);
router.post('/:id/clone', authenticate, authorize('ADMIN'), eventsController.clone);
router.post('/', authenticate, authorize('ADMIN'), eventsController.create);
router.put('/:id', authenticate, authorize('ADMIN'), eventsController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), eventsController.remove);

export { router as eventsRouter };
