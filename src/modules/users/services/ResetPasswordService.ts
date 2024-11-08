import { injectable, inject } from 'tsyringe';
import { AppError } from '@shared/errors/AppError';
import { IHashProvider } from '@shared/container/providers/HashProvider/models/IHashProvider';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserTokenRepository } from '../repositories/IUserTokenRepository';
import { IResetPasswordDTO } from '../dtos/IResetPasswordDTO';

@injectable()
export class ResetPasswordService {
  private readonly TOKEN_EXPIRATION_HOURS = 2;

  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('UserTokenRepository')
    private userTokenRepository: IUserTokenRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute(data: IResetPasswordDTO): Promise<void> {
    const { token, password } = data;
    const userToken = await this.userTokenRepository.findByToken(token);

    if (!userToken) {
      throw new AppError('Invalid or expired token', 401);
    }

    const { userId, createdAt } = userToken;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User does not exist', 404);
    }

    const expiresDateLimitToken = this.dateProvider.addHours(
      createdAt,
      this.TOKEN_EXPIRATION_HOURS,
    );
    const isExpiredToken = this.dateProvider.compareIfBefore(
      this.dateProvider.dateNow(),
      expiresDateLimitToken,
    );

    if (!isExpiredToken) {
      throw new AppError('Invalid or expired token', 401);
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    Object.assign(user, {
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  }
}
