import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";
import * as DropdownController from "../controllers/dropdown.controller";
import { authenticate } from "../middleware/auth.middleware";
import {
  isReviewer,
  isAdmin,
  isSuperAdmin,
} from "../middleware/rbac.middleware";
import {
  validateBody,
  validateQuery,
} from "../middleware/validation.middleware";
import {
  reviewSchema,
  approveSchema,
  requestDocsSchema,
  listAppsSchema,
  createStaffSchema,
  updateUserStatusSchema,
} from "../validation/admin.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get(
  "/applications",
  isReviewer,
  validateQuery(listAppsSchema),
  asyncHandler((req, res) => AdminController.listApplications(req, res))
);
router.get(
  "/applications/:id",
  isReviewer,
  asyncHandler((req, res) => AdminController.getApplication(req, res))
);
router.post(
  "/applications/:id/review",
  isReviewer,
  validateBody(reviewSchema),
  asyncHandler((req, res) => AdminController.setUnderReview(req as any, res))
);
router.post(
  "/applications/:id/approve",
  isReviewer,
  validateBody(approveSchema),
  asyncHandler((req, res) => AdminController.approve(req as any, res))
);
router.post(
  "/applications/:id/reject",
  isReviewer,
  asyncHandler((req, res) => AdminController.reject(req as any, res))
);
router.post(
  "/applications/:id/request-docs",
  isReviewer,
  validateBody(requestDocsSchema),
  asyncHandler((req, res) => AdminController.requestDocs(req as any, res))
);

// Users
router.get(
  "/users",
  isAdmin,
  asyncHandler((req, res) => AdminController.listUsers(req, res))
);
router.get(
  "/users/:id",
  isAdmin,
  asyncHandler((req, res) => AdminController.getUser(req, res))
);
router.patch(
  "/users/:id",
  isAdmin,
  validateBody(updateUserStatusSchema),
  asyncHandler((req, res) => AdminController.updateUser(req, res))
);
router.delete(
  "/users/:id",
  isAdmin,
  asyncHandler((req, res) => AdminController.deleteUser(req, res))
);
router.post(
  "/users",
  isSuperAdmin,
  validateBody(createStaffSchema),
  asyncHandler((req, res) => AdminController.createStaff(req, res))
);

router.get(
  "/stats",
  isReviewer,
  asyncHandler((req, res) => AdminController.stats(req, res))
);
router.get(
  "/audit",
  isAdmin,
  asyncHandler((req, res) => AdminController.audit(req, res))
);

// Reports
router.get(
  "/reports/applicants.csv",
  isAdmin,
  asyncHandler((req, res) => AdminController.exportApplicantsCsv(req, res))
);

// Licenses
router.get(
  "/licenses",
  isAdmin,
  asyncHandler((req, res) => AdminController.listLicenses(req, res))
);
router.patch(
  "/licenses/:id/status",
  isAdmin,
  asyncHandler((req, res) =>
    AdminController.updateLicenseStatus(req as any, res)
  )
);
router.post(
  "/licenses/expire-due",
  isAdmin,
  asyncHandler((req, res) => AdminController.expireDueLicenses(req, res))
);

// Renewals
router.get(
  "/renewals",
  isAdmin,
  asyncHandler((req, res) => AdminController.listRenewals(req, res))
);
router.post(
  "/renewals/:id/approve",
  isAdmin,
  asyncHandler((req, res) => AdminController.approveRenewal(req as any, res))
);
router.post(
  "/renewals/:id/reject",
  isAdmin,
  asyncHandler((req, res) => AdminController.rejectRenewal(req as any, res))
);

// Dropdowns CRUD (admin)
router.post(
  "/dropdowns",
  isAdmin,
  asyncHandler((req, res) => DropdownController.upsert(req, res))
);
router.put(
  "/dropdowns/:id",
  isAdmin,
  asyncHandler((req, res) => DropdownController.updateById!(req, res))
);
router.delete(
  "/dropdowns/:id",
  isAdmin,
  asyncHandler((req, res) => DropdownController.deleteById!(req, res))
);

export default router;
