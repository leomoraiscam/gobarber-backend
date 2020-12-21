import AppError from '@shared/errors/AppError';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import SendFogotPassworEmail from './SendForgotPasswordEmailService';

describe('SendFogotPassworEmail', () => {
  it('should be able to recover the password using email', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeMailProvider = new FakeMailProvider();

    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

    const sendForgotPasswordEmail = new SendFogotPassworEmail(
      fakeUsersRepository,
      fakeMailProvider,
    );

    await fakeUsersRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    await sendForgotPasswordEmail.execute({
      email: 'joh@example.com',
    });

    expect(sendMail).toHaveBeenCalled();
  });
});
