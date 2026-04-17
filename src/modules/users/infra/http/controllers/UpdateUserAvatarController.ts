import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserAvatarService } from '@modules/users/services/UpdateUserAvatarService';
import { classToClass } from 'class-transformer';

class UpdateUserAvatarController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const avatarFilename = request?.file?.filename;
    const updateUserAvatarService = container.resolve(UpdateUserAvatarService);
    const user = await updateUserAvatarService.execute({
      userId,
      avatar: avatarFilename,
    });
    const userResponse = classToClass(user);

    return response.status(200).json(userResponse);
  }
}

export const updateUserAvatarController = new UpdateUserAvatarController();
