/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from 'express';

export function validateAvatarPresence(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  if (!req.file) {
    return res.status(400).json({ message: 'Avatar field is required.' });
  }

  next();
}
