import jwt, { Secret, SignOptions } from "jsonwebtoken";

import crypto from "crypto";
import User from "../models/user.model";
import config from "../config";
import type {
  IJwtPayload,
  UserRole as UserRoleT,
  AuditAction as AuditActionT,
} from "../types/types";
import { UserRole, UserStatus, AuditAction } from "../types/runtime";
import { logAudit } from "./audit.service";

function signToken(payload: IJwtPayload) {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
  return jwt.sign(payload, config.jwt.secret as Secret, options);
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRoleT;
}) {
  const exists = await User.findOne({ email: data.email.toLowerCase() });
  if (exists)
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  const user = await User.create({
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phone: data.phone,
    role: data.role || UserRole.APPLICANT,
    status: UserStatus.ACTIVE,
  });

  await logAudit({
    action: AuditAction.USER_REGISTERED as AuditActionT,
    actorUserId: String(user._id),
    entityType: "User",
    entityId: String(user._id),
  });

  const token = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await user.comparePassword(password);
  if (!ok)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  user.lastLoginAt = new Date();
  await user.save();

  await logAudit({
    action: AuditAction.USER_LOGIN as AuditActionT,
    actorUserId: String(user._id),
    entityType: "User",
    entityId: String(user._id),
  });

  const token = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });
  return { user, token };
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return; // don't leak
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
  (user as any).passwordResetToken = token;
  (user as any).passwordResetExpires = expires;
  await user.save();
  return { token, user };
}

export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password");
  if (!user)
    throw Object.assign(new Error("Invalid or expired token"), { status: 400 });
  user.password = password;
  (user as any).passwordResetToken = undefined;
  (user as any).passwordResetExpires = undefined;
  await user.save();
  await logAudit({
    action: AuditAction.USER_UPDATED as AuditActionT,
    actorUserId: String(user._id),
    entityType: "User",
    entityId: String(user._id),
  });
  const jwtToken = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });
  return { user, token: jwtToken };
}

export async function updateMe(data: {
  userId: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}) {
  const user = await User.findById(String(data.userId));
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if (data.email) user.email = data.email;
  if (data.password) user.password = data.password;
  if (data.fullName) user.fullName = data.fullName;
  if (data.phone) user.phone = data.phone;
  await user.save();
  await logAudit({
    action: AuditAction.USER_UPDATED as AuditActionT,
    actorUserId: String(user._id),
    entityType: "User",
    entityId: String(user._id),
  });
  const jwtToken = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });
  return { user, token: jwtToken };
}
