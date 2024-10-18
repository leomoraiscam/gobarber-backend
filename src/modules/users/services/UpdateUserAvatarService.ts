import { injectable, inject } from 'tsyringe';
import { User } from '@modules/users/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvader';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUpdateUserAvatarDTO } from '../dtos/IUpdateUserAvatarDTO';

@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('StorageProvider')
    private storageProvider: IStorageProvider,
  ) {}

  async execute(data: IUpdateUserAvatarDTO): Promise<User> {
    const { userId, avatar } = data;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    if (user.avatar) {
      await this.storageProvider.deleteFile(user.avatar);
    }

    user.avatar = avatar;

    await Promise.all([
      this.storageProvider.saveFile(avatar),
      this.userRepository.save(user),
    ]);

    return user;
  }
}

export default UpdateUserAvatarService;
