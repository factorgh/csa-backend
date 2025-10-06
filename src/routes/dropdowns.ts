import { Router } from 'express';
import * as DropdownController from '../controllers/dropdown.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', DropdownController.listPublic);

router.use(authenticate, isAdmin);
router.get('/manage', (req, res, next) => DropdownController.manageList(req, res).catch(next));
router.post('/', (req, res, next) => DropdownController.upsert(req, res).catch(next));

export default router;
