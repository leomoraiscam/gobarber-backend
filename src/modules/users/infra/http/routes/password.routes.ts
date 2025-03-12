import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import { sendForgotPasswordMailController } from '@modules/users/infra/http/controllers/SendForgotPasswordMailController';
import { resetPasswordController } from '@modules/users/infra/http/controllers/ResetPasswordController';

const passwordRouter = Router();

passwordRouter.post(
  '/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  sendForgotPasswordMailController.handle,
);
passwordRouter.post(
  '/reset',
  celebrate({
    [Segments.QUERY]: {
      token: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      password: Joi.string()
        .min(6)
        .max(14)
        .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .required()
        .messages({
          'string.pattern.base':
            'The password must contain at least one number and one special character.',
        }),
    },
  }),
  resetPasswordController.handle,
);

export { passwordRouter };
