import multer from 'multer';
import path from 'path';
import config from '../config';

// Use memory storage to forward buffers to Cloudinary
const storage = (multer as any).memoryStorage();

function fileFilter(_req: any, file: any, cb: any) {
  const allowed = config.upload.allowedTypes.map((t) => t.trim().toLowerCase());
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
}

export const upload = (multer as any)({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter
});
