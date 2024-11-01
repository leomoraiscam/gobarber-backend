import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import { ListProvidersService } from '@modules/appointments/services/ListProvidersService';

class ListProvidersController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const listProvidersService = container.resolve(ListProvidersService);
    const providers = await listProvidersService.execute(userId);

    return response.status(200).json(classToClass(providers));
  }
}

export const listProvidersController = new ListProvidersController();
