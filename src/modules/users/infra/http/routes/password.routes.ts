import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import SendForgotPasswordMailController from '@modules/users/infra/http/controllers/SendForgotPasswordMailController';
import ResetPasswordController from '@modules/users/infra/http/controllers/ResetPasswordController';

const passwordRouter = Router();

passwordRouter.post(
  '/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  SendForgotPasswordMailController.handle,
);
passwordRouter.post(
  '/reset',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string().required(),
      passwordConfirmation: Joi.string().required().valid(Joi.ref('password')),
    },
  }),
  ResetPasswordController.handle,
);

export default passwordRouter;
