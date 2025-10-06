import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  uploaderUserId: mongoose.Types.ObjectId;
  documentType: string;
  filename: string;
  originalName: string;
  // Local storage path (optional when using Cloudinary)
  storagePath?: string;
  mimeType: string;
  size: number;
  // Cloudinary metadata
  url?: string;
  secureUrl?: string;
  publicId?: string;
  resourceType?: string;
  folder?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required']
    },
    uploaderUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required']
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true
    },
    filename: {
      type: String,
      required: [true, 'Filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required']
    },
    storagePath: {
      type: String
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    url: { type: String },
    secureUrl: { type: String },
    publicId: { type: String, index: true },
    resourceType: { type: String },
    folder: { type: String },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
documentSchema.index({ applicationId: 1 });
documentSchema.index({ uploaderUserId: 1 });
documentSchema.index({ uploadedAt: -1 });

const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

export default DocumentModel;
