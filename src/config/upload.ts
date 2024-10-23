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
        const SALT_RANDOM_BYTES = 10;
        const CRYPTO_TYPE = 'hex';
        const fileHash = crypto
          .randomBytes(SALT_RANDOM_BYTES)
          .toString(CRYPTO_TYPE);
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
