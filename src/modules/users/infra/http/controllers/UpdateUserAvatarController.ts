import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserAvatarService } from '@modules/users/services/UpdateUserAvatarService';
import { classToClass } from 'class-transformer';

class UpdateUserAvatarController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const imageFileName = request.file.filename;
    const updateUserAvatarService = container.resolve(UpdateUserAvatarService);
    const user = await updateUserAvatarService.execute({
      userId,
      avatar: imageFileName,
    });

    return response.json(classToClass(user));
  }
}

export const updateUserAvatarController = new UpdateUserAvatarController();
