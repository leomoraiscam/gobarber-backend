import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateUserService } from '@modules/users/services/CreateUserService';
import { classToClass } from 'class-transformer';

class CreateUserController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { name, email, password } = request.body;
    const createUserService = container.resolve(CreateUserService);
    const user = await createUserService.execute({ name, email, password });

    return response.status(201).json(classToClass(user));
  }
}

export const createUserController = new CreateUserController();
