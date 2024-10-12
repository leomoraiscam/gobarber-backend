import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import path from 'path';
import IUserRepository from '../repositories/IUserRepository';
import IUsersTokensRepository from '../repositories/IUsersTokensRepository';

@injectable()
class SendForgotPasswordMailService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('MailProvider')
    private mailProvider: IMailProvider,
    @inject('UserTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { token } = await this.usersTokensRepository.generate(user.id);
    const forgotPasswordMailTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'forgot_password.hbs',
    );
    const resetPasswordUrl =
      process.env.APP_URL && process.env.APP_PORT
        ? `${process.env.APP_URL}:${process.env.APP_PORT}reset_password?token=${token}`
        : `http://localhost:3333/reset_password?token=${token}`;

    await this.mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[GoBarber] Recuperação de senha',
      templateData: {
        file: forgotPasswordMailTemplate,
        variables: {
          name: user.name,
          link: resetPasswordUrl,
        },
      },
    });
  }
}

export default SendForgotPasswordMailService;
