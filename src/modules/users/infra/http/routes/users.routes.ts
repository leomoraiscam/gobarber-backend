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
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
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
