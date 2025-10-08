import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import * as AuthService from "../services/auth.service";
import { UserStatus } from "../types/runtime";

type ReqWithUser = Request & { user?: IUser };

/**
 * Register new user
 */
export async function register(req: Request, res: Response) {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    middleName,
    phoneNumber,
    telephoneNumber,
    designation,
    gender,
    role,
  } = req.body;

  const result = await AuthService.register({
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    middleName,
    phoneNumber,
    telephoneNumber,
    designation,
    gender,
    role,
  });

  res.status(201).json({ success: true, data: result });
}

/**
 * Register new user and create initial application in one call
 */
export async function registerWithApplication(req: Request, res: Response) {
  const { user, application } = req.body;

  const result = await AuthService.registerWithApplication({
    user,
    application,
  });

  res.status(201).json({ success: true, data: result });
}

/**
 * Login
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  //TODO: bEFORE RUNNING USER TO LOGIN SYSTEM CHECK STATUS FIRST,ONLY ALLOW ACTIVE ACCOUNT TO LOGIN
  const existing = await User.findOne({
    email: String(email).toLowerCase(),
  }).select("status");

  if (existing && existing.status !== UserStatus.ACTIVE) {
    throw Object.assign(new Error("Account is not set active"), {
      status: 403,
    });
  }

  const result = await AuthService.login(email, password);
  res.json({ success: true, data: result });
}

/**
 * Forgot Password
 */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  // Always return sent: true to avoid email enumeration
  res.json({ success: true, data: { sent: true, user: result?.user?._id } });
}

/**
 * Reset Password
 */
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  res.json({ success: true, data: result });
}

/**
 * Get Current User
 */
export async function me(req: ReqWithUser, res: Response) {
  res.json({ success: true, data: req.user });
}

/**
 * Update Current User Profile
 */
export async function updateMe(req: ReqWithUser, res: Response) {
  const {
    email,
    password,
    firstName,
    lastName,
    middleName,
    phoneNumber,
    telephoneNumber,
    designation,
    gender,
  } = req.body;

  const result = await AuthService.updateMe({
    userId: String(req.user!._id),
    email,
    password,
    firstName,
    lastName,
    middleName,
    phoneNumber,
    telephoneNumber,
    designation,
    gender,
  });

  res.json({ success: true, data: result });
}
