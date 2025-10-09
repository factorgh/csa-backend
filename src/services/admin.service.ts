import Application from "../models/application.model";
import User from "../models/user.model";
import Audit from "../models/audit.model";
import { paginate } from "../utils/paginate.util";
import { UserStatus } from "../types/types";
import { AuditAction } from "../types/runtime";
import { logAudit } from "./audit.service";
import type { AuditAction as AuditActionT } from "../types/types";

export async function listApplications(filter: any, pagination: any) {
  return paginate(Application as any, filter, {
    ...pagination,
    populate: {
      path: "applicantUserId",
      select: "firstName lastName email role status",
    },
  });
}

export async function getApplicationWithAudit(id: string) {
  const app = await Application.findById(id)
    .populate({
      path: "applicantUserId",
      select: "firstName lastName email role status",
    })
    .populate({
      path: "decisionBy",
      select: "firstName lastName email role status",
    });
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  const audit = await Audit.find({
    entityType: "Application",
    entityId: id,
  }).sort({ createdAt: -1 });
  return { app, audit };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const before = { status: user.status };
  user.status = status;
  await user.save();

  let action: AuditActionT | undefined;
  if (status === UserStatus.SUSPENDED) action = AuditAction.USER_SUSPENDED as AuditActionT;
  else if (status === UserStatus.DELETED) action = AuditAction.USER_DELETED as AuditActionT;
  else if (status === UserStatus.ACTIVE) action = AuditAction.USER_REACTIVATED as AuditActionT;

  if (action) {
    await logAudit({
      action: action,
      entityType: "User",
      entityId: String(user._id),
      before,
      after: { status: user.status },
    });
  }
  return user;
}

export async function deleteUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const before = { status: user.status };
  user.status = UserStatus.DELETED;
  await user.save();
  await logAudit({
    action: AuditAction.USER_DELETED as AuditActionT,
    entityType: "User",
    entityId: String(user._id),
    before,
    after: { status: user.status },
  });
  return user;
}

export async function statsOverview() {
  return applicationStats();
}

export async function applicationStats(filters?: { type?: string; status?: string; q?: string }) {
  const match: any = {};
  if (filters?.type) match.type = filters.type;
  if (filters?.status) match.status = filters.status;
  if (filters?.q) {
    const rx = new RegExp(filters.q, "i");
    match.$or = [
      { "data.companyName": rx },
      { "data.establishmentName": rx },
      { "data.institutionName": rx },
      { "data.registeringAs": rx },
      { "data.description": rx },
      { region: rx },
    ];
  }

  // For type distribution, honor status/q but not the specific type filter,
  // so consumers can see distribution across types under current filters
  const matchForTypeDist = { ...match } as any;
  if (matchForTypeDist.type) delete matchForTypeDist.type;

  const [statusAgg, typeAgg, total] = await Promise.all([
    Application.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: matchForTypeDist },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Application.countDocuments(match),
  ]);

  const statusCounts: Record<string, number> = {
    PENDING_DOCUMENTS: 0,
    PENDING: 0,
    UNDER_REVIEW: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const s of statusAgg) statusCounts[s._id] = s.count;

  const typeCounts: Record<string, number> = {
    PROVIDER: 0,
    PROFESSIONAL: 0,
    ESTABLISHMENT: 0,
  };
  for (const t of typeAgg) typeCounts[t._id] = t.count;

  return { total, status: statusCounts, types: typeCounts };
}

// Users
export async function listUsers(filter: any, pagination: any) {
  const q: any = {};
  if (filter.role) q.role = filter.role;
  if (filter.status) q.status = filter.status;
  if (filter.email) q.email = new RegExp(filter.email, "i");
  if (filter.name) {
    q.$or = [
      { firstName: new RegExp(filter.name, "i") },
      { lastName: new RegExp(filter.name, "i") },
      { middleName: new RegExp(filter.name, "i") },
    ];
  }
  return paginate(User as any, q, pagination);
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}
