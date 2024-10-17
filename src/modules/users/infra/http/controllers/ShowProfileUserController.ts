import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ShowUserProfileService from '@modules/users/services/ShowUserProfileService';
import { classToClass } from 'class-transformer';

export default new (class ShowProfileUserController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const showUserProfileService = await container.resolve(
      ShowUserProfileService,
    );
    const user = await showUserProfileService.execute(userId);

    return response.json(classToClass(user));
  }
})();
