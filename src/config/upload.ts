import path, { extname } from 'path';
import crypto from 'crypto';
import multer, { MulterError } from 'multer';
import { IUploadConfig } from './dtos/IUploadConfig';
import { UploadFolders } from './enums/uploadFolders';

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
        const fileHash = crypto.randomBytes(10).toString('hex');
        const extension = extname(file.originalname);
        const fileName = `${fileHash}${extension}`;

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
