import { StorageEngine } from 'multer';

export interface IUploadConfig {
  driver: 's3' | 'disk';
  multer: {
    storage: StorageEngine;
  };
  config: {
    disk: {};
    aws: {
      bucket: string;
    };
  };
  tmpFolder: string;
  uploadsFolder: string;
}
