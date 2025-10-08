import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import * as DropdownController from '../controllers/dropdown.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isReviewer, isAdmin, isSuperAdmin } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { reviewSchema, approveSchema, rejectSchema, requestDocsSchema, listAppsSchema, createStaffSchema, updateUserStatusSchema } from '../validation/admin.schema';

const router = Router();

router.use(authenticate);

router.get('/applications', isReviewer, validateQuery(listAppsSchema), (req, res, next) => AdminController.listApplications(req, res).catch(next));
router.get('/applications/:id', isReviewer, (req, res, next) => AdminController.getApplication(req, res).catch(next));
router.post('/applications/:id/review', isReviewer, validateBody(reviewSchema), (req, res, next) => AdminController.setUnderReview(req, res).catch(next));
router.post('/applications/:id/approve', isReviewer, validateBody(approveSchema), (req, res, next) => AdminController.approve(req, res).catch(next));
router.post('/applications/:id/reject', isReviewer, validateBody(rejectSchema), (req, res, next) => AdminController.reject(req, res).catch(next));
router.post('/applications/:id/request-docs', isReviewer, validateBody(requestDocsSchema), (req, res, next) => AdminController.requestDocs(req, res).catch(next));

// Users
router.get('/users', isAdmin, (req, res, next) => AdminController.listUsers(req, res).catch(next));
router.get('/users/:id', isAdmin, (req, res, next) => AdminController.getUser(req, res).catch(next));
router.patch('/users/:id', isAdmin, validateBody(updateUserStatusSchema), (req, res, next) => AdminController.updateUser(req, res).catch(next));
router.delete('/users/:id', isAdmin, (req, res, next) => AdminController.deleteUser(req, res).catch(next));
router.post('/users', isSuperAdmin, validateBody(createStaffSchema), (req, res, next) => AdminController.createStaff(req, res).catch(next));

router.get('/stats', isReviewer, (req, res, next) => AdminController.stats(req, res).catch(next));
router.get('/audit', isAdmin, (req, res, next) => AdminController.audit(req, res).catch(next));

// Reports
router.get('/reports/applicants.csv', isAdmin, (req, res, next) => AdminController.exportApplicantsCsv(req, res).catch(next));

// Dropdowns CRUD (admin)
router.post('/dropdowns', isAdmin, (req, res, next) => DropdownController.upsert(req, res).catch(next));
router.put('/dropdowns/:id', isAdmin, (req, res, next) => DropdownController.updateById!(req, res).catch(next));
router.delete('/dropdowns/:id', isAdmin, (req, res, next) => DropdownController.deleteById!(req, res).catch(next));

export default router;
