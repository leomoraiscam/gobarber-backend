import { injectable, inject } from 'tsyringe';
import { User } from '@modules/users/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUpdateUserProfileDTO } from '../dtos/IUpdateUserProfileDTO';

@injectable()
class UpdateUserProfileService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  async execute(data: IUpdateUserProfileDTO): Promise<User> {
    const { name, email, password, oldPassword, userId } = data;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingUserWithEmail = await this.userRepository.findByEmail(email);

    if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
      throw new AppError('User with this email already exists', 409);
    }

    Object.assign(user, {
      name,
      email,
    });

    if (password && !oldPassword) {
      throw new AppError(
        'You need to inform the old password to set a new password',
        422,
      );
    }

    if (password && oldPassword) {
      const matchPassword = await this.hashProvider.compareHash(
        oldPassword,
        user.password,
      );

      if (!matchPassword) {
        throw new AppError('Old password does not match', 403);
      }

      const hashedPassword = await this.hashProvider.generateHash(password);

      Object.assign(user, {
        password: hashedPassword,
      });
    }

    return this.userRepository.save(user);
  }
}

export default UpdateUserProfileService;
