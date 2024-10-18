import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import { sessionController } from '@modules/users/infra/http/controllers/SessionController';

const sessionRouter = Router();

sessionRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  sessionController.handle,
);

export default sessionRouter;
