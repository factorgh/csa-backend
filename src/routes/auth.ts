import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validateBody } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerWithApplicationSchema,
} from "../validation/auth.schema";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler((req, res) => AuthController.register(req, res))
);
router.post(
  "/register-with-application",
  validateBody(registerWithApplicationSchema),
  asyncHandler((req, res) => AuthController.registerWithApplication(req, res))
);
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler((req, res) => AuthController.login(req, res))
);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler((req, res) => AuthController.forgotPassword(req, res))
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler((req, res) => AuthController.resetPassword(req, res))
);

router.get(
  "/me",
  authenticate,
  asyncHandler((req, res) => AuthController.me(req as any, res))
);
router.put(
  "/me",
  authenticate,
  asyncHandler((req, res) => AuthController.updateMe(req as any, res))
);

export default router;
