import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ListProviderDailyAvailabilityByMonthService from '@modules/appointments/services/ListProviderDailyAvailabilityByMonthService';

export class ListProviderDailyAvailabilityByMonthController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year } = request.query;
    const listProviderDailyAvailabilityByMonthService = container.resolve(
      ListProviderDailyAvailabilityByMonthService,
    );
    const daysAvailabilityInMonth =
      await listProviderDailyAvailabilityByMonthService.execute({
        providerId,
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(daysAvailabilityInMonth);
  }
}

export const listProviderDailyAvailabilityByMonthController =
  new ListProviderDailyAvailabilityByMonthController();
