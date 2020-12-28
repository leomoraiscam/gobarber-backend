import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import ProvidersController from '@modules/appointments/infra/http/controllers/ProvidersControllers';
import ProviderDayAvailabilityController from '@modules/appointments/infra/http/controllers/ProviderDayAvailabilityController';
import ProviderMonthAvailabilityController from '@modules/appointments/infra/http/controllers/ProviderMonthAvailabilityController';

const providersRoutes = Router();

providersRoutes.get('/', ensureAuthenticated, ProvidersController.index);
providersRoutes.get(
  '/:provider_id/month-availability',
  ensureAuthenticated,
  ProviderMonthAvailabilityController.index,
);
providersRoutes.get(
  '/:provider_id/day-availability',
  ensureAuthenticated,
  ProviderDayAvailabilityController.index,
);

export default providersRoutes;
