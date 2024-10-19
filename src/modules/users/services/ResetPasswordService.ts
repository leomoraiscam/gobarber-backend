import { injectable, inject } from 'tsyringe';
import { isAfter, addHours } from 'date-fns';
import AppError from '@shared/errors/AppError';
import { IHashProvider } from '@shared/container/providers/HashProvider/models/IHashProvider';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserTokenRepository } from '../repositories/IUserTokenRepository';
import { IResetPasswordDTO } from '../dtos/IResetPasswordDTO';

@injectable()
export class ResetPasswordService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('UserTokenRepository')
    private userTokenRepository: IUserTokenRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  async execute(data: IResetPasswordDTO): Promise<void> {
    const { token, password } = data;
    const userToken = await this.userTokenRepository.findByToken(token);

    if (!userToken) {
      throw new AppError('Invalid or expired token', 401);
    }

    const { userId } = userToken;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User does not exist', 404);
    }

    const tokenCreatedAt = userToken.createdAt;
    const compareDate = addHours(tokenCreatedAt, 2);

    if (isAfter(Date.now(), compareDate)) {
      throw new AppError('Invalid or expired token', 401);
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    Object.assign(user, {
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  }
}
