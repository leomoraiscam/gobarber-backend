import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { errors } from 'celebrate';
import { upload } from '@config/upload';
import { AppError } from '@shared/errors/AppError';
import routes from '@shared/infra/http/routes';
import createConnection from '@shared/infra/typeorm';
import '@shared/container';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import rateLimiter from './middlewares/rateLimiter';
import swaggerDocument from './swagger.json';

if (process.env.NODE_ENV !== 'test') {
  createConnection();
}

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(rateLimiter);
app.use(cors());
app.use(express.json());
app.use('/files', express.static(upload.tmpFolder));
app.use(routes);
app.use(errors());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return (response as any).status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.log('Error', err);

  return (response as any).status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export { app };
