import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '@config/upload';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import CreateUserController from '@modules/users/infra/http/controllers/CreateUserController';
import UpdateUserAvatarController from '@modules/users/infra/http/controllers/UpdateUserAvatarController';

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
  CreateUserController.handle,
);
userRouter.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  UpdateUserAvatarController.handle,
);

export default userRouter;
