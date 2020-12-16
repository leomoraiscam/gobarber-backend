import { Request, Response } from 'express';
import { container } from 'tsyringe';
import UpdateUserAvatarService from '@modules/users/services/UpdateUserAvatarService';

export default new class UserAvatarController {
  public async update(request:Request, response: Response): Promise<Response>{

    const updateUserAvatar = container.resolve(UpdateUserAvatarService);
    const user = await updateUserAvatar.execute({
      user_id: request.user.id,
      avatarfilename: request.file.filename,
    });

    const serializedUser = {
      id: user.id,
      name: user.name,
      email: user.name,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return response.json(serializedUser);
  }
}
