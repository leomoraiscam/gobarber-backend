import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListProviderAvailabilityHoursByDailyService } from '@modules/appointments/services/ListProviderAvailabilityHoursByDailyService';

class ListProviderAvailabilityHoursByDailyController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year, day } = request.query;
    const listProviderAvailabilityHoursByDailyService = container.resolve(
      ListProviderAvailabilityHoursByDailyService,
    );
    const availableHours =
      await listProviderAvailabilityHoursByDailyService.execute({
        providerId,
        day: Number(day),
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(availableHours);
  }
}

export const listProviderAvailabilityHoursByDailyController =
  new ListProviderAvailabilityHoursByDailyController();
