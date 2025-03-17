import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListProviderAvailabilityDailiesByMonthService } from '@modules/appointments/services/ListProviderAvailabilityDailiesByMonthService';

class ListProviderAvailabilityDailiesByMonthController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year } = request.query;
    const listProviderAvailabilityDailiesByMonthService = container.resolve(
      ListProviderAvailabilityDailiesByMonthService,
    );
    const availableDays =
      await listProviderAvailabilityDailiesByMonthService.execute({
        providerId,
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(availableDays);
  }
}

export const listProviderAvailabilityDailiesByMonthController =
  new ListProviderAvailabilityDailiesByMonthController();
