import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import ListProvidersService from '@modules/appointments/services/ListProvidersService';

export class ListProvidersController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const listProvidersService = container.resolve(ListProvidersService);
    const providers = await listProvidersService.execute(userId);

    return response.status(200).json(classToClass(providers));
  }
}

export const listProvidersController = new ListProvidersController();
