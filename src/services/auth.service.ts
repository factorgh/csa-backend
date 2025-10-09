import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import mongoose, { ClientSession } from "mongoose";
import User from "../models/user.model";
import config from "../config";
import { createDraft } from "./application.service";
import type { ApplicationType } from "../types/types";
import type {
  IJwtPayload,
  UserRole as UserRoleT,
  AuditAction as AuditActionT,
} from "../types/types";
import { UserRole, UserStatus, AuditAction } from "../types/runtime";
import { logAudit } from "./audit.service";

/**
 * Helper: Sign a JWT
 */
function signToken(payload: IJwtPayload) {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
  return jwt.sign(payload, config.jwt.secret as Secret, options);
}

/**
 * Register new user
 */
export async function register(
  data: {
    email: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    telephoneNumber?: string;
    role?: UserRoleT;
    designation?: string;
    gender?: string;
  },
  options?: { session?: ClientSession }
) {
  const exists = await User.findOne({ email: data.email.toLowerCase() });
  if (exists)
    throw Object.assign(new Error("Email already in use"), { status: 409 });

  const user = await User.create(
    [
      {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        phoneNumber: data.phoneNumber,
        telephoneNumber: data.telephoneNumber,
        role: data.role || UserRole.APPLICANT,
        designation: data.designation,
        gender: data.gender,
        status: UserStatus.INACTIVE,
      },
    ],
    { session: options?.session }
  ).then((docs) => docs[0]);

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

/**
 * Register user and create initial application in one operation
 */
export async function registerWithApplication(args: {
  user: {
    email: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    telephoneNumber?: string;
    role?: UserRoleT;
    designation?: string;
    gender?: string;
  };
  application: { type: ApplicationType; data: any };
}) {
  const session = await mongoose.startSession();
  try {
    let result: { user: any; token: string; application: any } | undefined;
    await session.withTransaction(async () => {
      // Step 1: create user within transaction
      const { user, token } = await register(args.user, { session });

      // Step 2: create application draft within same transaction
      const application = await createDraft({
        applicantUserId: String(user._id),
        type: args.application.type,
        data: args.application.data,
        _session: session,
      } as any);

      result = { user, token, application };
    });
    return result!;
  } finally {
    session.endSession();
  }
}

/**
 * Login user
 */
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

/**
 * Forgot Password
 */
export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return; // Prevent user enumeration

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h expiry

  (user as any).passwordResetToken = token;
  (user as any).passwordResetExpires = expires;
  await user.save();

  return { token, user };
}

/**
 * Reset Password
 */
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

/**
 * Update user profile (self)
 */
export async function updateMe(data: {
  userId: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  telephoneNumber?: string;
  designation?: string;
  gender?: string;
}) {
  const user = await User.findById(String(data.userId));
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  if (data.email) user.email = data.email;
  if (data.password) user.password = data.password;
  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;
  if (data.middleName) user.middleName = data.middleName;
  if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
  if (data.telephoneNumber) user.telephoneNumber = data.telephoneNumber;
  if (data.designation) user.designation = data.designation;
  if (data.gender) user.gender = data.gender;

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
