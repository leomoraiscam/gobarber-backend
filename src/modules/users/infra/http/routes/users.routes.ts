import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '@config/upload';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { createUserController } from '@modules/users/infra/http/controllers/CreateUserController';
import { updateUserAvatarController } from '@modules/users/infra/http/controllers/UpdateUserAvatarController';

const upload = multer(uploadConfig.multer);
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
  upload.single('avatar'),
  updateUserAvatarController.handle,
);

export { userRouter };
