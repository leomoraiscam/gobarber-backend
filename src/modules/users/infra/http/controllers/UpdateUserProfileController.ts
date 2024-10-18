import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserProfileService } from '@modules/users/services/UpdateUserProfileService';
import { classToClass } from 'class-transformer';

export default new (class UpdateUserProfileController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { name, email, password, oldPassword } = request.body;
    const { id: userId } = request.user;
    const updateUserProfileService = container.resolve(
      UpdateUserProfileService,
    );
    const user = await updateUserProfileService.execute({
      name,
      email,
      password,
      oldPassword,
      userId,
    });

    return response.json(classToClass(user));
  }
})();
