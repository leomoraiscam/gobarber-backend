import { Router } from 'express';
import ProfileController from '@modules/users/infra/http/controllers/ProfileController';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

const profileRouter = Router();

profileRouter.get('/', ensureAuthenticated, ProfileController.show);
profileRouter.put('/', ensureAuthenticated, ProfileController.update);

export default profileRouter;
