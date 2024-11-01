import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListProviderDailiesAvailabilityByMonthService } from '@modules/appointments/services/ListProviderDailiesAvailabilityByMonthService';

export class ListProviderDailiesAvailabilityByMonthController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { providerId } = request.params;
    const { month, year } = request.query;
    const listProviderDailiesAvailabilityByMonthService = container.resolve(
      ListProviderDailiesAvailabilityByMonthService,
    );
    const daysAvailabilityInMonth =
      await listProviderDailiesAvailabilityByMonthService.execute({
        providerId,
        month: Number(month),
        year: Number(year),
      });

    return response.status(200).json(daysAvailabilityInMonth);
  }
}

export const listProviderDailiesAvailabilityByMonthController =
  new ListProviderDailiesAvailabilityByMonthController();
