import type { IUser } from "../models/user.model";

// Module augmentation for Express v4 core types
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

// declare global fallback (sometimes helpful depending on tooling)
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
