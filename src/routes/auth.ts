import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/auth.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res, next) => AuthController.register(req, res).catch(next));
router.post('/login', validateBody(loginSchema), (req, res, next) => AuthController.login(req, res).catch(next));
router.post('/forgot-password', validateBody(forgotPasswordSchema), (req, res, next) => AuthController.forgotPassword(req, res).catch(next));
router.post('/reset-password', validateBody(resetPasswordSchema), (req, res, next) => AuthController.resetPassword(req, res).catch(next));

router.get('/me', authenticate, (req, res) => AuthController.me(req, res));
router.put('/me', authenticate, (req, res) => AuthController.updateMe(req, res));

export default router;
