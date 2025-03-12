import multer from 'multer';
import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import { upload } from '@config/upload';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { createUserController } from '@modules/users/infra/http/controllers/CreateUserController';
import { updateUserProfileController } from '@modules/users/infra/http/controllers/UpdateUserProfileController';
import { showProfileUserController } from '@modules/users/infra/http/controllers/ShowProfileUserController';
import { updateUserAvatarController } from '@modules/users/infra/http/controllers/UpdateUserAvatarController';

const uploadAvatar = multer(upload.multer);
const userRouter = Router();

userRouter.get('/me', ensureAuthenticated, showProfileUserController.handle);
userRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string()
        .min(3)
        .max(255)
        .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)
        .required()
        .messages({
          'string.pattern.base':
            'The name must contain only letters and spaces.',
        }),
      email: Joi.string().email().required(),
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
  createUserController.handle,
);
userRouter.put(
  '/me',
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
userRouter.patch(
  '/me/avatar',
  ensureAuthenticated,
  uploadAvatar.single('avatar'),
  updateUserAvatarController.handle,
);

export { userRouter };
