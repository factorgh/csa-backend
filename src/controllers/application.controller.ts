import { Request, Response } from "express";
import type { IUser } from "../models/user.model";
type ReqWithUser = Request & { user?: IUser };
import * as AppService from "../services/application.service";
import DocumentModel from "../models/document.model";
import { AuditAction } from "../types/runtime";
import type { AuditAction as AuditActionT } from "../types/types";
import { logAudit } from "../services/audit.service";
import { uploadBuffer } from "../utils/cloudinary.util";

export async function createProvider(req: ReqWithUser, res: Response) {
  const app = await AppService.createDraft({
    applicantUserId: String(req.user!._id),
    type: "PROVIDER" as any,
    data: req.body,
  });
  res.status(201).json({ success: true, data: app });
}

export async function createProfessional(req: ReqWithUser, res: Response) {
  const app = await AppService.createDraft({
    applicantUserId: String(req.user!._id),
    type: "PROFESSIONAL" as any,
    data: req.body,
  });
  res.status(201).json({ success: true, data: app });
}

export async function createEstablishment(req: ReqWithUser, res: Response) {
  const app = await AppService.createDraft({
    applicantUserId: String(req.user!._id),
    type: "ESTABLISHMENT" as any,
    data: req.body,
  });
  res.status(201).json({ success: true, data: app });
}

export async function updateDraft(req: ReqWithUser, res: Response) {
  const app = await AppService.updateDraft(
    req.params.id,
    String(req.user!._id),
    req.body
  );
  res.json({ success: true, data: app });
}

export async function getApplication(req: ReqWithUser, res: Response) {
  const app = await AppService.getById(req.params.id, String(req.user!._id));
  res.json({ success: true, data: app });
}

export async function listApplications(req: ReqWithUser, res: Response) {
  const result = await AppService.listOwn(
    String(req.user!._id),
    req.query as any
  );
  res.json({ success: true, data: result.data, pagination: result.pagination });
}

export async function submit(req: ReqWithUser, res: Response) {
  const app = await AppService.submit(req.params.id, String(req.user!._id));
  res.json({ success: true, data: app });
}

export async function uploadDocuments(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  const files = (req as any).files as any[];
  const { type } = req.body;
  if (!files || files.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });

  // Upload to Cloudinary using in-memory buffers
  const uploaded = await Promise.all(
    files.map(async (f) => {
      const cloud = await uploadBuffer(f.buffer, f.originalname);
      const doc = await DocumentModel.create({
        applicationId: req.params.id,
        uploaderUserId: req.user!._id,
        documentType: type || "UNKNOWN",
        filename: cloud.public_id || f.originalname,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        url: (cloud as any).url,
        secureUrl: (cloud as any).secure_url,
        publicId: cloud.public_id,
        resourceType: cloud.resource_type,
        folder: (cloud as any).folder,
      } as any);
      return doc;
    })
  );

  await logAudit({
    action: AuditAction.DOCUMENT_UPLOADED as AuditActionT,
    actorUserId: String(req.user!._id),
    entityType: "Application",
    entityId: req.params.id,
    metadata: { count: uploaded.length },
  });
  return res.status(201).json({ success: true, data: uploaded });
}
