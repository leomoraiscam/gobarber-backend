import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListProviderDailyHoursAvailabilityService } from '@modules/appointments/services/ListProviderDailyHoursAvailabilityService';

class ListProviderDailyHoursAvailabilityController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year, day } = request.query;
    const listProviderDailyHoursAvailabilityService = container.resolve(
      ListProviderDailyHoursAvailabilityService,
    );
    const hoursAvailabilityInDay =
      await listProviderDailyHoursAvailabilityService.execute({
        providerId,
        day: Number(day),
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(hoursAvailabilityInDay);
  }
}

export const listProviderDailyHoursAvailabilityController =
  new ListProviderDailyHoursAvailabilityController();
