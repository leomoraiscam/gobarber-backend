import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import ProvidersController from '@modules/appointments/infra/http/controllers/ProvidersControllers';

const providersRoutes = Router();

providersRoutes.get('/', ensureAuthenticated, ProvidersController.index);

export default providersRoutes;
