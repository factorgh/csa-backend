import type { Request } from "express";

// Extend Express Request safely without model or Multer hard dependencies
declare global {
  namespace Express {
    interface Request {
      // Minimal auth user shape to avoid circular deps in .d.ts
      user?:
        | {
            _id: string;
            email: string;
            fullName?: string;
            role: UserRole;
          }
        | any;
      file?: any;
      files?: any[];
    }
  }
}
