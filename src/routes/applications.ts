import { Router } from 'express';
import * as AppController from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateZodBody } from '../middleware/zod.middleware';
import { providerSchema, professionalSchema, establishmentSchema } from '../validation/application.zod';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/provider', validateZodBody(providerSchema), (req, res, next) => AppController.createProvider(req, res).catch(next));
router.post('/professional', validateZodBody(professionalSchema), (req, res, next) => AppController.createProfessional(req, res).catch(next));
router.post('/establishment', validateZodBody(establishmentSchema), (req, res, next) => AppController.createEstablishment(req, res).catch(next));

router.put('/:id', (req, res, next) => AppController.updateDraft(req, res).catch(next));
router.get('/:id', (req, res, next) => AppController.getApplication(req, res).catch(next));
router.get('/', (req, res, next) => AppController.listApplications(req, res).catch(next));
router.post('/:id/submit', (req, res, next) => AppController.submit(req, res).catch(next));
router.post('/:id/upload', upload.array('files', 10), (req, res, next) => AppController.uploadDocuments(req, res).catch(next));

export default router;
