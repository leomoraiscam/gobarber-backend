import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ListProviderDailyHourAvailabilityService from '@modules/appointments/services/ListProviderDailyHourAvailabilityService';

export class ListProviderDailyHourAvailabilityController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year, day } = request.query;
    const listProviderDailyHourAvailabilityService = container.resolve(
      ListProviderDailyHourAvailabilityService,
    );
    const hoursAvailabilityInDay =
      await listProviderDailyHourAvailabilityService.execute({
        providerId,
        day: Number(day),
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(hoursAvailabilityInDay);
  }
}

export const listProviderDailyHourAvailabilityController =
  new ListProviderDailyHourAvailabilityController();
