import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { createAppointmentController } from '@modules/appointments/infra/http/controllers/CreateAppointmentController';
import { listProviderAppointmentsController } from '@modules/appointments/infra/http/controllers/ListProviderAppointmentsController';

const appointmentRouter = Router();

appointmentRouter.post(
  '/',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      providerId: Joi.string().uuid().required(),
      date: Joi.date().required(),
    },
  }),
  createAppointmentController.handle,
);
appointmentRouter.get(
  '/me',
  ensureAuthenticated,
  celebrate({
    [Segments.QUERY]: {
      day: Joi.number().integer().min(1).max(31).required(),
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2020).required(),
    },
  }),
  listProviderAppointmentsController.handle,
);

export { appointmentRouter };
