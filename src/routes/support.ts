import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as SupportController from "../controllers/support.controller";

const router = Router();

router.post(
  "/contact",
  asyncHandler((req, res) => SupportController.contact(req, res))
);

export default router;
