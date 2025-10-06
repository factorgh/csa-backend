import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import config from '../config';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export async function uploadBuffer(buffer: Buffer, filename: string, folder?: string): Promise<UploadApiResponse> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw Object.assign(new Error('Cloudinary is not configured'), { status: 500 });
  }
  const uploadFolder = folder || config.cloudinary.folder || 'uploads';
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: uploadFolder,
      resource_type: 'auto',
      filename_override: filename,
      use_filename: true,
      unique_filename: true
    }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
      if (error || !result) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export async function deleteByPublicId(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
}
