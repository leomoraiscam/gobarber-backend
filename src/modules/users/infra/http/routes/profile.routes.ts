import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import UpdateUserProfileController from '@modules/users/infra/http/controllers/UpdateUserProfileController';
import ShowProfileUserController from '@modules/users/infra/http/controllers/ShowProfileUserController';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

const profileRouter = Router();

profileRouter.get('/', ensureAuthenticated, ShowProfileUserController.handle);
profileRouter.put(
  '/',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      oldPassword: Joi.string(),
      password: Joi.string(),
      passwordConfirmation: Joi.string().valid(Joi.ref('password')),
    },
  }),
  UpdateUserProfileController.handle,
);

export default profileRouter;
