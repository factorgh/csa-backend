import mongoose, { Document, Schema } from "mongoose";
import { ApplicationType, LicenseStatus } from "../types/types";

export interface ILicense extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  licenseNumber: string;
  type: ApplicationType;
  issuedAt: Date;
  expiresAt?: Date;
  status: LicenseStatus;
  verificationHash: string;
  holderName: string;
  holderEmail: string;
  organizationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const licenseSchema = new Schema<ILicense>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application ID is required"],
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(ApplicationType),
      required: [true, "License type is required"],
    },
    issuedAt: {
      type: Date,
      required: [true, "Issue date is required"],
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(LicenseStatus),
      default: LicenseStatus.ACTIVE,
    },
    verificationHash: {
      type: String,
      required: [true, "Verification hash is required"],
    },
    holderName: {
      type: String,
      required: [true, "Holder name is required"],
    },
    holderEmail: {
      type: String,
      required: [true, "Holder email is required"],
    },
    organizationName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
licenseSchema.index({ licenseNumber: 1 }, { unique: true });
licenseSchema.index({ applicationId: 1 }, { unique: true });
licenseSchema.index({ status: 1 });
licenseSchema.index({ verificationHash: 1 });

const License = mongoose.model<ILicense>("License", licenseSchema);

export default License;
