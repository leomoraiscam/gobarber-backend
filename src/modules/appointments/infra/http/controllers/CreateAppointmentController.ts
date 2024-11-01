import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateAppointmentService } from '@modules/appointments/services/CreateAppointmentService';

class CreateAppointmentController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const { providerId, date } = request.body;
    const createAppointmentService = container.resolve(
      CreateAppointmentService,
    );
    const appointment = await createAppointmentService.execute({
      date,
      providerId,
      userId,
    });

    return response.status(201).json(appointment);
  }
}

export const createAppointmentController = new CreateAppointmentController();
