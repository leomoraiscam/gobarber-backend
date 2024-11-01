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
      date: Joi.date(),
    },
  }),
  createAppointmentController.handle,
);
appointmentRouter.get(
  '/me',
  ensureAuthenticated,
  listProviderAppointmentsController.handle,
);

export { appointmentRouter };
