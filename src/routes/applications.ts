import { Router } from 'express';
import * as AppController from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateZodBody } from '../middleware/zod.middleware';
import { providerSchema, professionalSchema, establishmentSchema } from '../validation/application.zod';
import { upload } from '../middleware/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/provider', validateZodBody(providerSchema), asyncHandler((req, res) => AppController.createProvider(req, res)));
router.post('/professional', validateZodBody(professionalSchema), asyncHandler((req, res) => AppController.createProfessional(req, res)));
router.post('/establishment', validateZodBody(establishmentSchema), asyncHandler((req, res) => AppController.createEstablishment(req, res)));

router.put('/:id', asyncHandler((req, res) => AppController.updateDraft(req, res)));
router.get('/:id', asyncHandler((req, res) => AppController.getApplication(req, res)));
router.get('/', asyncHandler((req, res) => AppController.listApplications(req, res)));
router.post('/:id/submit', asyncHandler((req, res) => AppController.submit(req, res)));
router.post('/:id/upload', upload.array('files', 10), asyncHandler((req, res) => AppController.uploadDocuments(req, res)));

export default router;
