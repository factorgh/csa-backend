import mongoose, { Schema, Document } from "mongoose";

export enum RenewalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IRenewalRequest extends Document {
  _id: mongoose.Types.ObjectId;
  licenseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: RenewalStatus;
  notes?: string;
  requestedAt: Date;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const renewalRequestSchema = new Schema<IRenewalRequest>(
  {
    licenseId: { type: Schema.Types.ObjectId, ref: "License", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(RenewalStatus),
      default: RenewalStatus.PENDING,
      index: true,
    },
    notes: { type: String },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

renewalRequestSchema.index({ licenseId: 1, status: 1 });
renewalRequestSchema.index({ userId: 1, status: 1 });

const RenewalRequest = mongoose.model<IRenewalRequest>(
  "RenewalRequest",
  renewalRequestSchema
);

export default RenewalRequest;
