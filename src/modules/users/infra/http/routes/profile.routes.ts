import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import { updateUserProfileController } from '@modules/users/infra/http/controllers/UpdateUserProfileController';
import { showProfileUserController } from '@modules/users/infra/http/controllers/ShowProfileUserController';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

const profileRouter = Router();

profileRouter.get('/', ensureAuthenticated, showProfileUserController.handle);
profileRouter.put(
  '/',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      name: Joi.string()
        .min(3)
        .max(255)
        .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)
        .optional()
        .messages({
          'string.pattern.base':
            'The name must contain only letters and spaces.',
        }),
      email: Joi.string().email().optional(),
      password: Joi.string()
        .min(6)
        .max(14)
        .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .optional()
        .messages({
          'string.pattern.base':
            'The password must contain at least one number and one special character.',
        }),
      oldPassword: Joi.string().optional(),
      passwordConfirmation: Joi.string()
        .min(6)
        .max(14)
        .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .optional()
        .messages({
          'string.pattern.base':
            'The password must contain at least one number and one special character.',
        }),
    },
  }),
  updateUserProfileController.handle,
);

export { profileRouter };
