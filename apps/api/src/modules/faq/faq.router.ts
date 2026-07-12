import { Router } from 'express';
import { faqController } from './faq.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/', faqController.list);
router.get('/search', faqController.search);
router.get('/:id', faqController.getById);
router.post('/', authenticate, authorize('ADMIN'), faqController.create);
router.put('/:id', authenticate, authorize('ADMIN'), faqController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), faqController.remove);

export { router as faqRouter };
