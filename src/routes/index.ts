import { Router } from "express";
import authRoutes from "./auth";
import applicationRoutes from "./applications";
import adminRoutes from "./admin";
import dropdownRoutes from "./dropdowns";

const router = Router();

router.use("/auth", authRoutes);
router.use("/applications", applicationRoutes);
router.use("/admin", adminRoutes);
router.use("/dropdowns", dropdownRoutes);

// Utilities
router.get("/license/:licenseNumber", async (req, res) => {
  // Lazy import to avoid circular deps
  const { default: License } = await import("../models/license.model");
  const license = await License.findOne({
    licenseNumber: req.params.licenseNumber,
  });
  if (!license)
    return res
      .status(404)
      .json({ success: false, message: "License not found" });
  return res.json({ success: true, data: license });
});

export default router;
