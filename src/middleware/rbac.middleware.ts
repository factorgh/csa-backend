import { Request, Response, NextFunction } from "express";
import type { IUser } from "../models/user.model";
type ReqWithUser = Request & { user?: IUser };
import { UserRole } from "../types/types";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: ReqWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};

export const isApplicant = authorize(UserRole.APPLICANT);
export const isReviewer = authorize(
  UserRole.REVIEWER,
  UserRole.ADMIN,
  UserRole.SUPERADMIN
);
export const isAdmin = authorize(UserRole.ADMIN, UserRole.SUPERADMIN);
export const isSuperAdmin = authorize(UserRole.SUPERADMIN);
