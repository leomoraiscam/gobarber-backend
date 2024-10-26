import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import { AuthenticateUserService } from '@modules/users/services/AuthenticateUserService';

class SessionController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const authenticatedUserService = container.resolve(AuthenticateUserService);
    const { user, token } = await authenticatedUserService.execute({
      email,
      password,
    });

    return response.status(200).json({ user: classToClass(user), token });
  }
}

export const sessionController = new SessionController();
