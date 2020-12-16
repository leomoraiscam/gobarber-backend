import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import appointmentController from '@modules/appointments/infra/http/controllers/AppointmentsController';

const appointmentsRouter = Router();

/*appointmentsRouter.get('/', ensureAuthenticated, async (request, response) => {
  const appointments = await appointmentRepository.find();

  return response.json(appointments);
});*/

appointmentsRouter.post('/', ensureAuthenticated, appointmentController.create);

export default appointmentsRouter;
