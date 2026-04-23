import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

import { AppError } from '@shared/errors/AppError';

export function avatarLimit(
  error: any,
  req: Request,
  res: Response,
  _: NextFunction,
): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error instanceof MulterError) {
    const multerErrorsMapping: Record<
      string,
      { statusCode: number; message: string }
    > = {
      LIMIT_FILE_SIZE: {
        statusCode: 422,
        message: 'File exceeds 2MB limit.',
      },
      INVALID_FORMAT_FILE: {
        statusCode: 400,
        message: 'Invalid file format.',
      },
    };

    const message =
      multerErrorsMapping[error.code].message ||
      'Error occurred while uploading the file.';

    return res
      .status(multerErrorsMapping[error.code].statusCode)
      .json({ message });
  }

  return res.status(500).json({ status: 'error', message: error.message });
}
