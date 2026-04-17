import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

export function avatarLimit(
  error: any,
  req: Request,
  res: Response,
  _: NextFunction,
): Response {
  if (error instanceof MulterError) {
    const multerErrorsMapping: Record<
      string,
      { statusCode: number; message: string }
    > = {
      LIMIT_FILE_SIZE: {
        statusCode: 422,
        message: 'Arquivo excede o limite de 2MB.',
      },
      INVALID_FORMAT_FILE: {
        statusCode: 400,
        message: 'Formato do arquivo Invalido',
      },
    };

    const message =
      multerErrorsMapping[error.code].message || 'Erro no upload do arquivo.';

    return res
      .status(multerErrorsMapping[error.code].statusCode)
      .json({ message });
  }

  console.log('error', error);

  return res.status(500).json({ status: 'error', message: error.message });
}
