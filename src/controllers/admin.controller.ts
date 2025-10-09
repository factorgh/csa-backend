import { Request, Response } from "express";
import type { IUser } from "../models/user.model";
import User from "../models/user.model";
type ReqWithUser = Request & { user?: IUser };
import * as AdminService from "../services/admin.service";
import * as AppService from "../services/application.service";
import * as AuthService from "../services/auth.service";
import { UserStatus, UserRole as UserRoleT } from "../types/types";

console.log("all bugs fixed");

export async function listApplications(req: Request, res: Response) {
  const filter: any = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  // Search by companyName (varies by type) and user name using a generic `q` param
  const q = (req.query.q || req.query.companyName || req.query.name) as
    | string
    | undefined;
  if (q && q.trim()) {
    const rx = new RegExp(q.trim(), "i");
    const or: any[] = [
      { "data.companyName": rx },
      { "data.establishmentName": rx },
      { "data.institutionName": rx },
    ];
    // Find users by first or last name and include their IDs
    const users = await User.find(
      { $or: [{ firstName: rx }, { lastName: rx }] },
      { _id: 1 }
    )
      .limit(200)
      .lean();
    const userIds = users.map((u: any) => u._id);
    if (userIds.length > 0) {
      or.push({ applicantUserId: { $in: userIds } });
    }
    filter.$or = or;
  }

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {} as any;
    if (req.query.startDate)
      filter.createdAt.$gte = new Date(String(req.query.startDate));
    if (req.query.endDate)
      filter.createdAt.$lte = new Date(String(req.query.endDate));
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await AdminService.listApplications(filter, { page, limit });
  // Limit payload to the requested fields
  const items = (result.data as any[]).map((a) => {
    const user = a.applicantUserId || {};
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    let companyName: string | undefined;
    if (a.type === "ESTABLISHMENT") companyName = a?.data?.establishmentName;
    else if (a.type === "PROVIDER") companyName = a?.data?.companyName;
    else if (a.type === "PROFESSIONAL") companyName = a?.data?.institutionName;

    return {
      id: a._id,
      fullName: fullName || undefined,
      status: a.status,
      createdAt: a.createdAt,
      companyName,
      type: a.type,
    };
  });
  res.json({ success: true, data: items, pagination: result.pagination });
}

export async function getApplication(req: Request, res: Response) {
  const result = await AdminService.getApplicationWithAudit(req.params.id);
  const appDoc = result.app as any;
  const user = appDoc?.applicantUserId;
  const app = appDoc?.toObject ? appDoc.toObject() : appDoc;
  if (app && app.applicantUserId) delete app.applicantUserId;
  res.json({ success: true, data: { user, app } });
}

export async function setUnderReview(req: ReqWithUser, res: Response) {
  const { notes } = req.body;
  const app = await AppService.setUnderReview(
    req.params.id,
    String(req.user!._id),
    notes
  );
  res.json({ success: true, data: app });
}

export async function approve(req: ReqWithUser, res: Response) {
  const { expiresAt } = req.body;
  const result = await AppService.approve(
    req.params.id,
    String(req.user!._id),
    { expiresAt: expiresAt ? new Date(expiresAt) : undefined }
  );
  res.json({ success: true, data: result });
}

export async function reject(req: ReqWithUser, res: Response) {
  const app = await AppService.reject(req.params.id, String(req.user!._id));
  res.json({ success: true, data: app });
}

export async function requestDocs(req: ReqWithUser, res: Response) {
  const { docs } = req.body as any;
  const app = await AppService.requestDocuments(
    req.params.id,
    String(req.user!._id),
    docs || []
  );
  res.json({ success: true, data: app });
}

export async function updateUser(req: Request, res: Response) {
  const { status } = req.body as any;

  if (status) {
    const user = await AdminService.updateUserStatus(
      req.params.id,
      status as UserStatus
    );
    return res.json({ success: true, data: user });
  }
  // Password reset flow could go here
  return res.json({ success: true, message: "No action performed" });
}

export async function deleteUser(req: Request, res: Response) {
  const user = await AdminService.deleteUser(req.params.id);
  return res.json({ success: true, data: user });
}

export async function stats(req: Request, res: Response) {
  const { type, status, q } = req.query as any;
  const data = await AdminService.applicationStats({ type, status, q });
  return res.json({ success: true, data });
}

export async function audit(_req: Request, res: Response) {
  const { default: Audit } = await import("../models/audit.model");
  const { action, userId, startDate, endDate, limit } = _req.query as any;
  const q: any = {};
  if (action) q.action = action;
  if (userId) q.actorUserId = userId;
  if (startDate || endDate) {
    q.createdAt = {} as any;
    if (startDate) q.createdAt.$gte = new Date(String(startDate));
    if (endDate) q.createdAt.$lte = new Date(String(endDate));
  }
  const max = Math.min(2000, Number(limit) || 500);
  const list = await Audit.find(q).sort({ createdAt: -1 }).limit(max);
  return res.json({ success: true, data: list });
}

// Users
export async function listUsers(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { role, status, email, name } = req.query as any;
  const result = await AdminService.listUsers(
    { role, status, email, name },
    { page, limit }
  );
  res.json({ success: true, data: result.data, pagination: result.pagination });
}

export async function getUser(req: Request, res: Response) {
  const user = await AdminService.getUserById(req.params.id);
  res.json({ success: true, data: user });
}

export async function exportApplicantsCsv(req: Request, res: Response) {
  const filter: any = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {} as any;
    if (req.query.startDate)
      filter.createdAt.$gte = new Date(String(req.query.startDate));
    if (req.query.endDate)
      filter.createdAt.$lte = new Date(String(req.query.endDate));
  }
  const { data } = await AdminService.listApplications(filter, {
    page: 1,
    limit: 1000,
  });
  const header = ["id", "type", "status", "createdAt"].join(",");
  const lines = (data as any[]).map((a) =>
    [a._id, a.type, a.status, a.createdAt?.toISOString?.() || ""].join(",")
  );
  const csv = [header, ...lines].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=applicants.csv");
  res.status(200).send(csv);
}

// Superadmin: create reviewer/admin
export async function createStaff(
  req: Request,
  res: Response
): Promise<Response> {
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
  } = req.body as any;

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
    role: role as UserRoleT,
  });

  return res.status(201).json({ success: true, data: result });
}
