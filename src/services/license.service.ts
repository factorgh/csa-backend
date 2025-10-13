import License from "../models/license.model";
import Application from "../models/application.model";
import RenewalRequest, { RenewalStatus } from "../models/renewal-request.model";
import { paginate } from "../utils/paginate.util";
import { AuditAction, LicenseStatus } from "../types/types";
import { logAudit } from "./audit.service";
import { sendEmail } from "./notification.service";
import { generateLicenseNumber, generateVerificationHash } from "../utils/license.util";

export async function getLicenseById(id: string) {
  const lic = await License.findById(id);
  if (!lic) throw Object.assign(new Error("License not found"), { status: 404 });
  return lic;
}

export async function listLicenses(filter: any, pagination: any) {
  const q: any = {};
  if (filter.status) q.status = filter.status;
  if (filter.type) q.type = filter.type;
  if (filter.expiresBefore) q.expiresAt = { $lte: new Date(filter.expiresBefore) };
  if (filter.expiresAfter) q.expiresAt = { ...(q.expiresAt || {}), $gte: new Date(filter.expiresAfter) };
  if (filter.q) {
    const rx = new RegExp(String(filter.q), "i");
    q.$or = [
      { licenseNumber: rx },
      { holderName: rx },
      { holderEmail: rx },
      { organizationName: rx },
    ];
  }
  return paginate(License as any, q, { ...pagination, sort: { createdAt: -1 } });
}

export async function listUserLicenses(userId: string, pagination: any) {
  // Join via Applications created by this user, then fetch Licenses by applicationId
  const apps = await Application.find({ applicantUserId: userId })
    .select({ _id: 1 })
    .lean();
  const appIds = apps.map((a: any) => a._id);
  const filter: any = { applicationId: { $in: appIds } };
  return paginate(License as any, filter, { ...pagination, sort: { createdAt: -1 } });
}

export async function listUserLicensesByEmail(
  email: string,
  filter: { status?: string; expiresBefore?: string | Date; expiresAfter?: string | Date },
  pagination: any
) {
  const q: any = { holderEmail: email };
  if (filter?.status) q.status = filter.status;
  if (filter?.expiresBefore) q.expiresAt = { $lte: new Date(filter.expiresBefore) };
  if (filter?.expiresAfter) q.expiresAt = { ...(q.expiresAt || {}), $gte: new Date(filter.expiresAfter) };
  return paginate(License as any, q, { ...pagination, sort: { createdAt: -1 } });
}

export async function updateLicenseStatus(
  licenseId: string,
  status: LicenseStatus,
  actorUserId?: string,
  notes?: string
) {
  const lic = await License.findById(licenseId);
  if (!lic) throw Object.assign(new Error("License not found"), { status: 404 });
  const before = lic.toObject();
  (lic as any).status = status;
  await lic.save();
  await logAudit({
    action: AuditAction.LICENSE_STATUS_UPDATED,
    actorUserId,
    entityType: "License",
    entityId: String(lic._id),
    before,
    after: lic,
    meta: { notes },
  } as any);
  return lic;
}

export async function requestRenewal(
  licenseId: string,
  userId: string,
  notes?: string
) {
  const lic = await License.findById(licenseId);
  if (!lic) throw Object.assign(new Error("License not found"), { status: 404 });
  const req = await RenewalRequest.create({
    licenseId: lic._id,
    userId,
    notes,
    status: RenewalStatus.PENDING,
    requestedAt: new Date(),
  } as any);
  await logAudit({
    action: AuditAction.LICENSE_RENEWAL_REQUESTED,
    actorUserId: userId,
    entityType: "License",
    entityId: String(lic._id),
    after: req,
  } as any);
  return req;
}

export async function listRenewalRequests(filter: any, pagination: any) {
  const q: any = {};
  if (filter.status) q.status = filter.status;
  if (filter.licenseId) q.licenseId = filter.licenseId;
  if (filter.userId) q.userId = filter.userId;
  return paginate(RenewalRequest as any, q, { ...pagination, sort: { createdAt: -1 } });
}

export async function decideRenewal(
  renewalId: string,
  decision: "APPROVE" | "REJECT",
  actorUserId: string,
  options?: { newExpiry?: Date; notes?: string }
) {
  const req = await RenewalRequest.findById(renewalId);
  if (!req) throw Object.assign(new Error("Renewal request not found"), { status: 404 });
  if (req.status !== RenewalStatus.PENDING)
    throw Object.assign(new Error("Renewal already decided"), { status: 400 });
  const lic = await License.findById(req.licenseId);
  if (!lic) throw Object.assign(new Error("License not found"), { status: 404 });

  if (decision === "APPROVE") {
    const oldLic = lic;
    const oldBefore = oldLic.toObject();
    // Compute base date and new expiry (12 months after base)
    const baseDate = options?.newExpiry ?? new Date();
    const addMonths = (d: Date, months: number) => {
      const nd = new Date(d.getTime());
      nd.setMonth(nd.getMonth() + months);
      return nd;
    };
    const newExpires = addMonths(baseDate, 12);

    // Create a new license (superseding the old one)
    const newLicenseNumber = generateLicenseNumber(oldLic.type as any);
    const verificationHash = generateVerificationHash(newLicenseNumber);
    const newLic = await License.create({
      applicationId: oldLic.applicationId,
      licenseNumber: newLicenseNumber,
      type: oldLic.type,
      issuedAt: baseDate,
      expiresAt: newExpires,
      status: LicenseStatus.ACTIVE as any,
      verificationHash,
      holderName: (oldLic as any).holderName,
      holderEmail: (oldLic as any).holderEmail,
      organizationName: (oldLic as any).organizationName,
    } as any);

    // Mark old license as expired immediately to avoid overlap
    (oldLic as any).status = LicenseStatus.EXPIRED as any;
    await oldLic.save();

    // Update application to point to the new current license
    await Application.updateOne(
      { _id: oldLic.applicationId },
      { $set: { licenseId: (newLic as any)._id } }
    );

    // Update renewal request status
    req.status = RenewalStatus.APPROVED;
    req.decidedAt = new Date();
    await req.save();

    // Audits
    await logAudit({
      action: AuditAction.LICENSE_RENEWAL_APPROVED,
      actorUserId,
      entityType: "License",
      entityId: String(newLic._id),
      before: oldBefore,
      after: newLic,
      meta: { supersedes: String(oldLic._id) },
    } as any);
    await logAudit({
      action: AuditAction.LICENSE_GENERATED,
      actorUserId,
      entityType: "License",
      entityId: String(newLic._id),
      after: newLic,
    } as any);
    await logAudit({
      action: AuditAction.LICENSE_EXPIRED,
      actorUserId,
      entityType: "License",
      entityId: String(oldLic._id),
      before: oldBefore,
      after: oldLic,
      meta: { supersededBy: String(newLic._id) },
    } as any);
    await logAudit({
      action: AuditAction.LICENSE_RENEWED,
      actorUserId,
      entityType: "License",
      entityId: String(newLic._id),
      after: { expiresAt: newLic.expiresAt },
      meta: { supersedes: String(oldLic._id) },
    } as any);

    // Notify holder about the new license
    try {
      await sendEmail(
        (newLic as any).holderEmail,
        "License Renewal Approved",
        `
        <p>Dear ${(newLic as any).holderName},</p>
        <p>Your license renewal has been approved and a new license has been issued.</p>
        <p>New License Number: ${(newLic as any).licenseNumber}</p>
        <p>Valid Until: ${(newLic as any).expiresAt?.toLocaleString?.() || "N/A"}</p>
        <p>The previous license (${(oldLic as any).licenseNumber}) is now expired.</p>
        `
      );
    } catch {}

    return { lic: newLic, req };
  } else {
    req.status = RenewalStatus.REJECTED;
    req.decidedAt = new Date();
    await req.save();
    await logAudit({
      action: AuditAction.LICENSE_RENEWAL_REJECTED,
      actorUserId,
      entityType: "License",
      entityId: String(lic._id),
      after: req,
      meta: { notes: options?.notes },
    } as any);
    try {
      await sendEmail(
        lic.holderEmail,
        "License Renewal Rejected",
        `
        <p>Dear ${lic.holderName},</p>
        <p>Your license renewal has been rejected.</p>
        <p>License Number: ${lic.licenseNumber}</p>
        <p>Reason: ${options?.notes || ""}</p>
        `
      );
    } catch {}
    return { lic, req };
  }
}

export async function expireDueLicenses(now: Date = new Date()) {
  const due = await License.find({
    expiresAt: { $lte: now },
    status: { $ne: LicenseStatus.EXPIRED as any },
  });
  let updated = 0;
  for (const lic of due) {
    const before = lic.toObject();
    (lic as any).status = LicenseStatus.EXPIRED as any;
    await lic.save();
    updated++;
    await logAudit({
      action: AuditAction.LICENSE_EXPIRED,
      entityType: "License",
      entityId: String(lic._id),
      before,
      after: lic,
    } as any);
    // Optionally notify holder
    try {
      await sendEmail(
        lic.holderEmail,
        "License Expired",
        `
        <p>Dear ${lic.holderName},</p>
        <p>Your license has expired.</p>
        <p>License Number: ${lic.licenseNumber}</p>
        <p>Please submit a renewal request.</p>
        `
      );
    } catch {}
  }
  return { count: updated };
}
