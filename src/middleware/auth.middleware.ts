import { Request, Response, NextFunction } from "express";
import type { IUser } from "../models/user.model";
type ReqWithUser = Request & { user?: IUser };
import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/user.model";
import { UserStatus, IJwtPayload } from "../types/types";

export const authenticate = async (
  req: ReqWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;

      // Get user from database
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found. Authorization denied.",
        });
        return;
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        res.status(403).json({
          success: false,
          message: "Account is suspended or inactive.",
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// export const optionalAuth = async (req: Request, res: Response, next: NextFunction): void => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.split(' ')[1];

//       try {
//         const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;
//         const user = await User.findById(decoded.userId);

//         if (user && user.status === UserStatus.ACTIVE) {
//           req.user = user;
//         }
//       } catch (error) {
//         // Token invalid but continue anyway
//       }
//     }

//     next();
//   } catch (error) {
//     next();
//   }
// };
