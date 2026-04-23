import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { listProvidersController } from '@modules/appointments/infra/http/controllers/ListProvidersController';
import { listProviderAvailabilityDailiesByMonthController } from '@modules/appointments/infra/http/controllers/ListProviderAvailabilityDailiesByMonthController';
import { listProviderAvailabilityHoursByDailyController } from '@modules/appointments/infra/http/controllers/ListProviderAvailabilityHoursByDailyController';

const providerRoutes = Router();

providerRoutes.get('/', ensureAuthenticated, listProvidersController.handle);
providerRoutes.get(
  '/:providerId/month-availability',
  celebrate({
    [Segments.PARAMS]: {
      providerId: Joi.string().uuid().required(),
    },
    [Segments.QUERY]: {
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2020).required(),
    },
  }),
  ensureAuthenticated,
  listProviderAvailabilityDailiesByMonthController.handle,
);
providerRoutes.get(
  '/:providerId/day-availability',
  celebrate({
    [Segments.PARAMS]: {
      providerId: Joi.string().uuid().required(),
    },
    [Segments.QUERY]: {
      day: Joi.number().integer().min(1).max(31).required(),
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2020).required(),
    },
  }),
  ensureAuthenticated,
  listProviderAvailabilityHoursByDailyController.handle,
);

export { providerRoutes };
