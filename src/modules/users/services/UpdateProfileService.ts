import { injectable, inject } from 'tsyringe';
import User from '@modules/users/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  name: string;
  email: string;
  password?: string;
  old_password?: string;
  user_id: string;
}

@injectable()
class UpdateProfileService {
  constructor(
    @inject('UserRepository')
    private usersRepository: IUsersRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  async execute({
    name,
    email,
    password,
    old_password,
    user_id,
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const userWithUdatedEmail = await this.usersRepository.findByEmail(email);

    if (userWithUdatedEmail && userWithUdatedEmail.id !== user.id) {
      throw new AppError('E-mail alredy in use');
    }

    Object.assign(user, {
      name,
      email,
    });

    if (password && !old_password) {
      throw new AppError(
        'You need to inform the old password to set a new password',
      );
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        user.password,
      );

      if (!checkOldPassword) {
        throw new AppError('Old password does not match');
      }

      Object.assign(user, {
        password: await this.hashProvider.generateHash(password),
      });
    }

    return this.usersRepository.save(user);
  }
}

export default UpdateProfileService;
