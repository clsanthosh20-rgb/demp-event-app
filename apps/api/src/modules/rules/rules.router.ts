import { Router } from 'express';
import { rulesController } from './rules.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/', rulesController.list);
router.get('/all', authenticate, authorize('ADMIN'), rulesController.listAll);
router.get('/:id', rulesController.getById);
router.post('/', authenticate, authorize('ADMIN'), rulesController.create);
router.put('/:id', authenticate, authorize('ADMIN'), rulesController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), rulesController.remove);

export { router as rulesRouter };
