import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { isCelebrateError } from 'celebrate';
import { upload } from '@config/upload';
import { AppError } from '@shared/errors/AppError';
import routes from '@shared/infra/http/routes';
import '@shared/infra/typeorm';
import '@shared/container';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import rateLimiter from './middlewares/rateLimiter';
import swaggerDocument from './swagger.json';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(rateLimiter);
app.use(cors());
app.use(express.json());
app.use('/files', express.static(upload.tmpFolder));
app.use(routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (isCelebrateError(err)) {
    const message = err.details.get('body')?.message || 'Validation failed';

    return response.status(400).json({
      status: 'error',
      message: message.replace(/"/g, ''),
    });
  }

  console.log('Error', err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333');
});
