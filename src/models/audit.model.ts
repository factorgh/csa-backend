import mongoose, { Document, Schema } from "mongoose";
import type { AuditAction as AuditActionT } from "../types/types";
import { AuditAction } from "../types/runtime";

export interface IAudit extends Document {
  _id: mongoose.Types.ObjectId;
  actorUserId?: mongoose.Types.ObjectId;
  action: AuditActionT;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: [true, "Action is required"],
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient audit queries
auditSchema.index({ actorUserId: 1, createdAt: -1 });
auditSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ createdAt: -1 });

const Audit = mongoose.model<IAudit>("Audit", auditSchema);

export default Audit;
