import mongoose, { Document, Schema } from "mongoose";
import {
  ApplicationType,
  ApplicationStatus,
  ApplicationData,
} from "../types/types";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  type: ApplicationType;
  status: ApplicationStatus;
  data: ApplicationData;
  submittedAt?: Date;
  decidedAt?: Date;
  decisionBy?: mongoose.Types.ObjectId;
  decisionComment?: string;
  reviewerNotes?: string;
  licenseId?: mongoose.Types.ObjectId;
  region?: string;
  documentsRequired?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    applicantUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant user ID is required"],
    },
    type: {
      type: String,
      enum: Object.values(ApplicationType),
      required: [true, "Application type is required"],
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, "Application data is required"],
    },
    submittedAt: {
      type: Date,
    },
    decidedAt: {
      type: Date,
    },
    decisionBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    decisionComment: {
      type: String,
      trim: true,
    },
    reviewerNotes: {
      type: String,
      trim: true,
    },
    licenseId: {
      type: Schema.Types.ObjectId,
      ref: "License",
    },
    region: {
      type: String,
      trim: true,
    },
    documentsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
applicationSchema.index({ applicantUserId: 1, status: 1 });
applicationSchema.index({ type: 1, status: 1 });
applicationSchema.index({ submittedAt: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);

export default Application;
