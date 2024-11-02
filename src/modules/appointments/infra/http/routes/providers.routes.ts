import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { listProvidersController } from '@modules/appointments/infra/http/controllers/ListProvidersController';
import { listProviderDailyHoursAvailabilityController } from '@modules/appointments/infra/http/controllers/ListProviderDailyHoursAvailabilityController';
import { listProviderDailiesAvailabilityByMonthController } from '@modules/appointments/infra/http/controllers/ListProviderDailiesAvailabilityByMonthController';

const providerRoutes = Router();

providerRoutes.get('/', ensureAuthenticated, listProvidersController.handle);
providerRoutes.get(
  '/:providerId/month-availability',
  celebrate({
    [Segments.PARAMS]: {
      providerId: Joi.string().uuid().required(),
    },
  }),
  listProviderDailiesAvailabilityByMonthController.handle,
);
providerRoutes.get(
  '/:providerId/day-availability',
  celebrate({
    [Segments.PARAMS]: {
      providerId: Joi.string().uuid().required(),
    },
  }),
  listProviderDailyHoursAvailabilityController.handle,
);

export { providerRoutes };
