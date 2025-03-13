import { injectable, inject } from 'tsyringe';
import { User } from '@modules/users/infra/typeorm/entities/User';
import { AppError } from '@shared/errors/AppError';
import { IHashProvider } from '@shared/container/providers/HashProvider/models/IHashProvider';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUpdateUserProfileDTO } from '../dtos/IUpdateUserProfileDTO';

@injectable()
export class UpdateUserProfileService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  async execute(data: IUpdateUserProfileDTO): Promise<User> {
    const { name, email, password, oldPassword, passwordConfirmation, userId } =
      data;
    const [user, userWithSameEmail] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.findByEmail(email),
    ]);
    const isEmailTaken = userWithSameEmail && userWithSameEmail.id !== user.id;

    if (isEmailTaken) {
      throw new AppError('User already exists', 409);
    }

    Object.assign(user, {
      name,
      email,
    });

    if (!password) {
      return this.userRepository.save(user);
    }

    if (password && passwordConfirmation && password !== passwordConfirmation) {
      throw new AppError(
        'Password and password confirmation are not the same',
        422,
      );
    }

    if (password && !oldPassword) {
      throw new AppError(
        'You need to inform the old password to set a new password',
        422,
      );
    }

    if (password && !passwordConfirmation) {
      throw new AppError(
        'You need to inform the password confirmation to set a new password',
        422,
      );
    }

    const isOldPasswordValid = await this.hashProvider.compareHash(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new AppError('Invalid old password', 422);
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    Object.assign(user, { password: hashedPassword });

    return user;
  }
}
