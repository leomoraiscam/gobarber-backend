import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import AppointmentController from '@modules/appointments/infra/http/controllers/AppointmentsController';
import ProviderAppointmentsController from '@modules/appointments/infra/http/controllers/ProviderAppointmentsController';

const appointmentsRouter = Router();

appointmentsRouter.post('/', ensureAuthenticated, AppointmentController.create);
appointmentsRouter.get(
  '/me',
  ensureAuthenticated,
  ProviderAppointmentsController.index,
);
export default appointmentsRouter;
