import { Request, Response } from "express";
import type { IUser } from "../models/user.model";
type ReqWithUser = Request & { user?: IUser };
import * as AdminService from "../services/admin.service";
import * as AppService from "../services/application.service";
import { UserStatus } from "../types/types";

console.log("all bugs fixed");

export async function listApplications(req: Request, res: Response) {
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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await AdminService.listApplications(filter, { page, limit });
  res.json({ success: true, data: result.data, pagination: result.pagination });
}

export async function getApplication(req: Request, res: Response) {
  const result = await AdminService.getApplicationWithAudit(req.params.id);
  res.json({ success: true, data: result });
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
  const { comment } = req.body;
  const app = await AppService.reject(
    req.params.id,
    String(req.user!._id),
    comment
  );
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

export async function stats(_req: Request, res: Response) {
  const data = await AdminService.statsOverview();
  return res.json({ success: true, data });
}

export async function audit(_req: Request, res: Response) {
  // simple passthrough, filtering can be added
  const { default: Audit } = await import("../models/audit.model");
  const list = await Audit.find({}).sort({ createdAt: -1 }).limit(500);
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
