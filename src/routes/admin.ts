import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isReviewer, isAdmin } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { reviewSchema, approveSchema, rejectSchema, requestDocsSchema, listAppsSchema } from '../validation/admin.schema';

const router = Router();

router.use(authenticate);

router.get('/applications', isReviewer, validateQuery(listAppsSchema), (req, res, next) => AdminController.listApplications(req, res).catch(next));
router.get('/applications/:id', isReviewer, (req, res, next) => AdminController.getApplication(req, res).catch(next));
router.post('/applications/:id/review', isReviewer, validateBody(reviewSchema), (req, res, next) => AdminController.setUnderReview(req, res).catch(next));
router.post('/applications/:id/approve', isReviewer, validateBody(approveSchema), (req, res, next) => AdminController.approve(req, res).catch(next));
router.post('/applications/:id/reject', isReviewer, validateBody(rejectSchema), (req, res, next) => AdminController.reject(req, res).catch(next));
router.post('/applications/:id/request-docs', isReviewer, validateBody(requestDocsSchema), (req, res, next) => AdminController.requestDocs(req, res).catch(next));

router.patch('/users/:id', isAdmin, (req, res, next) => AdminController.updateUser(req, res).catch(next));
router.delete('/users/:id', isAdmin, (req, res, next) => AdminController.deleteUser(req, res).catch(next));

router.get('/stats', isReviewer, (req, res, next) => AdminController.stats(req, res).catch(next));
router.get('/audit', isAdmin, (req, res, next) => AdminController.audit(req, res).catch(next));

export default router;
