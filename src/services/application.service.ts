import Application, { IApplication } from "../models/application.model";
import User from "../models/user.model";
import type { ClientSession } from "mongoose";
import License from "../models/license.model";
import { ApplicationStatus, ApplicationType } from "../types/types";
import {
  generateLicenseNumber,
  generateVerificationHash,
} from "../utils/license.util";
import { logAudit } from "./audit.service";
import { AuditAction, UserStatus } from "../types/types";

export async function createDraft(params: {
  applicantUserId: string;
  type: ApplicationType;
  data: any;
  _session?: ClientSession;
}): Promise<IApplication> {
  const app = await Application.create(
    [
      {
        applicantUserId: params.applicantUserId,
        type: params.type,
        status: ApplicationStatus.PENDING,
        data: params.data,
      } as any,
    ],
    { session: params._session }
  ).then((docs) => docs[0]);
  await logAudit({
    action: AuditAction.APPLICATION_CREATED,
    actorUserId: params.applicantUserId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  return app;
}

export async function updateDraft(
  appId: string,
  userId: string,
  updates: any
): Promise<IApplication> {
  const app = await Application.findOne({
    _id: appId,
    applicantUserId: userId,
  });
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  if (![ApplicationStatus.PENDING].includes(app.status)) {
    throw Object.assign(
      new Error("Cannot modify application in current status"),
      { status: 400 }
    );
  }
  const before = app.toObject();
  Object.assign(app.data as any, updates);
  await app.save();
  await logAudit({
    action: AuditAction.APPLICATION_UPDATED,
    actorUserId: userId,
    entityType: "Application",
    entityId: String(app._id),
    before,
    after: app,
  });
  return app;
}

export async function submit(
  appId: string,
  userId: string
): Promise<IApplication> {
  const app = await Application.findOne({
    _id: appId,
    applicantUserId: userId,
  });
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  if (![ApplicationStatus.PENDING].includes(app.status)) {
    throw Object.assign(
      new Error("Cannot submit application in current status"),
      { status: 400 }
    );
  }
  app.status = ApplicationStatus.PENDING;
  app.submittedAt = new Date();
  await app.save();
  await logAudit({
    action: AuditAction.APPLICATION_SUBMITTED,
    actorUserId: userId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  return app;
}

export async function listOwn(
  userId: string,
  query: { status?: string; type?: string; page?: number; limit?: number }
) {
  const filter: any = { applicantUserId: userId };
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "applicantUserId",
        select: "firstName lastName email role status",
      }),
    Application.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getById(
  appId: string,
  userId: string
): Promise<IApplication> {
  console.log("getById", appId, userId);
  const app = await Application.findOne({
    _id: appId,
    applicantUserId: userId,
  }).populate({
    path: "applicantUserId",
    select: "firstName lastName email role status",
  });
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  return app;
}

export async function approve(
  appId: string,
  reviewerId: string,
  options?: { expiresAt?: Date }
) {
  const app = await Application.findById(appId);
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  // if (app.status !== ApplicationStatus.UNDER_REVIEW)
  //   throw Object.assign(new Error("Application must be under review"), {
  //     status: 400,
  //   });

  const licenseNumber = generateLicenseNumber(app.type);
  const verificationHash = generateVerificationHash(licenseNumber);

  // Fetch applicant for fallback name/email
  const applicant = await User.findById(app.applicantUserId).lean();

  // Derive holder from the applicant user ONLY (source of truth)
  let holderName =
    [applicant?.firstName, applicant?.lastName].filter(Boolean).join(" ") ||
    "Holder";
  let holderEmail =
    typeof applicant?.email === "string" ? applicant!.email : "";
  let organizationName: string | undefined = undefined;

  const validEmail = (v: any) =>
    typeof v === "string" && /\S+@\S+\.\S+/.test(v.trim());

  if (app.type === ApplicationType.PROVIDER) {
    const d: any = app.data;
    const reg = d.registration || {};
    organizationName = reg.nameOfInstitution;
  } else if (app.type === ApplicationType.PROFESSIONAL) {
    organizationName = undefined;
  } else if (app.type === ApplicationType.ESTABLISHMENT) {
    const d: any = app.data;
    const est = d.establishment || {};
    organizationName = est.name;
  }

  if (!validEmail(holderEmail)) {
    throw Object.assign(new Error("Valid holder email not found for license"), {
      status: 400,
    });
  }

  const license = await License.create({
    applicationId: app._id,
    licenseNumber,
    type: app.type,
    issuedAt: new Date(),
    expiresAt: options?.expiresAt,
    status: "ACTIVE",
    verificationHash,
    holderName,
    holderEmail,
    organizationName,
  } as any);

  app.status = ApplicationStatus.APPROVED;
  app.decidedAt = new Date();
  (app as any).decisionBy = reviewerId as any;
  (app as any).licenseId = license._id as any;
  await app.save();

  await logAudit({
    action: AuditAction.APPLICATION_APPROVED,
    actorUserId: reviewerId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  await logAudit({
    action: AuditAction.LICENSE_GENERATED,
    actorUserId: reviewerId,
    entityType: "License",
    entityId: String(license._id),
    after: license,
  });

  // Also activate the applicant user upon approval
  try {
    const user = await User.findById(app.applicantUserId);
    if (user && user.status !== UserStatus.ACTIVE) {
      const before = { status: user.status } as any;
      user.status = UserStatus.ACTIVE as any;
      await user.save();
      await logAudit({
        action: AuditAction.USER_REACTIVATED,
        actorUserId: reviewerId,
        entityType: "User",
        entityId: String(user._id),
        before,
        after: { status: user.status },
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to activate user on approval", e);
  }

  return { app, license };
}

export async function setUnderReview(
  appId: string,
  reviewerId: string,
  notes?: string
) {
  const app = await Application.findById(appId);
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });

  (app as any).reviewerNotes = notes;
  app.status = ApplicationStatus.UNDER_REVIEW;
  await app.save();
  await logAudit({
    action: AuditAction.APPLICATION_REVIEWED,
    actorUserId: reviewerId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  return app;
}

export async function reject(appId: string, reviewerId: string) {
  const app = await Application.findById(appId);
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  if (app.status !== ApplicationStatus.UNDER_REVIEW)
    throw Object.assign(new Error("Application must be under review"), {
      status: 400,
    });
  app.status = ApplicationStatus.REJECTED;
  app.decidedAt = new Date();
  (app as any).decisionBy = reviewerId as any;

  await app.save();
  await logAudit({
    action: AuditAction.APPLICATION_REJECTED,
    actorUserId: reviewerId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  return app;
}

export async function requestDocuments(
  appId: string,
  reviewerId: string,
  docs: string[]
) {
  const app = await Application.findById(appId);
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  app.status;
  (app as any).documentsRequired = docs;
  await app.save();
  await logAudit({
    action: AuditAction.DOCUMENTS_REQUESTED,
    actorUserId: reviewerId,
    entityType: "Application",
    entityId: String(app._id),
    after: app,
  });
  return app;
}
