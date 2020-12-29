import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import AuthenticatedUserService from '@modules/users/services/AuthenticateUserService';

export default new (class SessionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const authenticatedUser = container.resolve(AuthenticatedUserService);

    const { user, token } = await authenticatedUser.execute({
      email,
      password,
    });

    return response.json({ user: classToClass(user), token });
  }
})();
