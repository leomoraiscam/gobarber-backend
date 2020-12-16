import { Router } from 'express';
import { parseISO } from 'date-fns';
import AppointmentRepository from '@modules/appointments/infra/typeorm/repositories/AppointmentsRepository';
import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

const appointmentsRouter = Router();
const appointmentsRepository = new AppointmentRepository();

/*appointmentsRouter.get('/', ensureAuthenticated, async (request, response) => {
  const appointments = await appointmentRepository.find();

  return response.json(appointments);
});*/

appointmentsRouter.post('/', ensureAuthenticated, async (request, response) => {
  try {
    const { provider_id, date } = request.body;

    const parsedDate = parseISO(date);

    const createAppointment = new CreateAppointmentService(appointmentsRepository);

    const appointment = await createAppointment.execute({
      date: parsedDate,
      provider_id,
    });

    return response.json(appointment);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default appointmentsRouter;
