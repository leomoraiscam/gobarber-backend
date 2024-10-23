import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { IUploadConfig } from './dtos/IUploadConfig';
import { UploadFolders } from './enums/uploadFolders';

const tmpFolder = path.resolve(__dirname, '..', '..', UploadFolders.TMP);
export const upload = {
  driver: process.env.STORAGE_DRIVER,
  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, UploadFolders.UPLOADS),
  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename: (_, file, callback) => {
        const fileHash = crypto.randomBytes(10).toString('hex');
        const fileName = `${fileHash}-${file.originalname}`;

        return callback(null, fileName);
      },
    }),
  },
  config: {
    disk: {},
    aws: {
      bucket: process.env.UPLOAD_AWS_BUCKET,
    },
  },
} as IUploadConfig;
