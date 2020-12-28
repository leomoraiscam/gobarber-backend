import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ListProviderDayAvaliabilityService from '@modules/appointments/services/ListProviderDayAvaliabilityService';

export default new (class ProviderDayAvailabilityController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { provider_id } = request.params;
    const { month, year, day } = request.body;

    const listProviderDayAvaliability = container.resolve(
      ListProviderDayAvaliabilityService,
    );

    const avaliability = await listProviderDayAvaliability.execute({
      provider_id,
      month,
      year,
      day,
    });

    return response.json(avaliability);
  }
})();
