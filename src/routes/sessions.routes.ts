import { Router } from 'express';
import AuthenticatedUserService from '../services/AuthenticateUserService';

const sessionRouter = Router();

sessionRouter.post('/', async (request, response) => {
  try {
    const { email, password } = request.body;

    const authenticatedUser = new AuthenticatedUserService();

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
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

export default sessionRouter;
