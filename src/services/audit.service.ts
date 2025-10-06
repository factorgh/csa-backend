import Audit, { IAudit } from "../models/audit.model";
import type { AuditAction } from "../types/types";

export async function logAudit(params: {
  actorUserId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}): Promise<IAudit> {
  const audit = await Audit.create({
    actorUserId: params.actorUserId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    before: params.before,
    after: params.after,
    ip: params.ip,
    userAgent: params.userAgent,
    metadata: params.metadata,
  } as any);
  return audit;
}
