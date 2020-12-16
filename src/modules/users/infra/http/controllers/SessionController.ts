import { Request, Response } from 'express';
import { container } from 'tsyringe';
import AuthenticatedUserService from '@modules/users/services/AuthenticateUserService';

export default new class SessionController {
  public async create(request:Request, response: Response): Promise<Response> {

    const { email, password } = request.body;

    const authenticatedUser = container.resolve(AuthenticatedUserService);

    const { user, token } = await authenticatedUser.execute({
      email,
      password,
    });

    const serializedUser = {
      id: user.id,
      name: user.name,
      email: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return response.json({ user: serializedUser, token });
  }
}
