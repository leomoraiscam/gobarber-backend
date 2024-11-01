import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListProviderAppointmentsService } from '@modules/appointments/services/ListProviderAppointmentsService';
import { classToClass } from 'class-transformer';

class ListProviderAppointmentsController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: providerId } = request.user;
    const { day, month, year } = request.query;
    const listProviderAppointmentsService = container.resolve(
      ListProviderAppointmentsService,
    );
    const appointments = await listProviderAppointmentsService.execute({
      providerId,
      day: Number(day),
      month: Number(month),
      year: Number(year),
    });

    return response.status(200).json(classToClass(appointments));
  }
}

export const listProviderAppointmentsController =
  new ListProviderAppointmentsController();
