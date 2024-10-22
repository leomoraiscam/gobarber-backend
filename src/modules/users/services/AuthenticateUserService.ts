import { sign } from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { auth } from '@config/auth';
import AppError from '@shared/errors/AppError';
import { IUserRepository } from '@modules/users/repositories/IUserRepository';
import { IHashProvider } from '@shared/container/providers/HashProvider/models/IHashProvider';
import { IAuthenticateUserDTO } from '../dtos/IAuthenticateUserDTO';
import { IAuthenticatedUserDTO } from '../dtos/IAuthenticatedUserDTO';

@injectable()
export class AuthenticateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  async execute(data: IAuthenticateUserDTO): Promise<IAuthenticatedUserDTO> {
    const { email, password } = data;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const matchPassword = await this.hashProvider.compareHash(
      password,
      user.password,
    );

    if (!matchPassword) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const { secret, expiresIn } = auth.jwt;
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return { user, token };
  }
}
