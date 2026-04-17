/* eslint-disable no-bitwise */
/* eslint-disable no-else-return */
import path from 'path';
import crypto from 'crypto';
import multer, { MulterError } from 'multer';
import { IUploadConfig } from './dtos/IUploadConfig';
import { UploadFolders } from './enums/uploadFolders';

// const folders: string = 'tmp' | 'upload';

const tmpFolder = path.resolve(__dirname, '..', '..', UploadFolders.TMP);
const maxFileSize = 3 * 1024 * 1024;
const fileExtensionsAllowed = ['.jpg', '.png'];

export const upload = {
  driver: process.env.STORAGE_DRIVER,
  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, UploadFolders.UPLOADS),
  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename: (_, file, callback) => {
        const SALT_RANDOM_BYTES = 10;
        const CRYPTO_HASH = 'hex';
        const fileHash = crypto
          .randomBytes(SALT_RANDOM_BYTES)
          .toString(CRYPTO_HASH);
        const fileName = `${fileHash}-${file.originalname}`;

        return callback(null, fileName);
      },
    }),
    fileFilter: (_, file, cb) => {
      const extension = path.extname(file.originalname);

      if (!fileExtensionsAllowed.includes(extension)) {
        return cb(new MulterError('INVALID_FORMAT_FILE' as multer.ErrorCode));
      }

      return cb(null, true);
    },
    limits: { fileSize: maxFileSize },
  },
  config: {
    disk: {},
    aws: {
      bucket: process.env.UPLOAD_AWS_BUCKET,
    },
  },
} as IUploadConfig;
