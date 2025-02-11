import { Router } from 'express';
import multer from 'multer';
import { upload } from '@config/upload';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { createUserController } from '@modules/users/infra/http/controllers/CreateUserController';
import { updateUserAvatarController } from '@modules/users/infra/http/controllers/UpdateUserAvatarController';

const uploadAvatar = multer(upload.multer);
const userRouter = Router();

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
userRouter.patch(
  '/avatar',
  ensureAuthenticated,
  uploadAvatar.single('avatar'),
  updateUserAvatarController.handle,
);

export { userRouter };
