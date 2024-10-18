import { injectable, inject } from 'tsyringe';
import { User } from '@modules/users/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';
import { IUserRepository } from '../repositories/IUserRepository';

@injectable()
export class ShowUserProfileService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
