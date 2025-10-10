import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import * as LicenseController from "../controllers/license.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/me",
  asyncHandler((req, res) => LicenseController.listMyLicenses(req as any, res))
);

router.post(
  "/:id/renewals",
  asyncHandler((req, res) => LicenseController.requestRenewal(req as any, res))
);

export default router;
