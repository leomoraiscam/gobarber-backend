import AppError from '@shared/errors/AppError';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import FakeUserRepository from '../repositories/fakes/FakeUserRepository';
import SendForgotPasswordMailService from './SendForgotPasswordMailService';

describe('SendForgotPasswordMailService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeMailProvider: FakeMailProvider;
  let fakeUserTokensRepository: FakeUserTokensRepository;
  let sendForgotPasswordMailService: SendForgotPasswordMailService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    sendForgotPasswordMailService = new SendForgotPasswordMailService(
      fakeUserRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should be able to send recover the password when received correct data', async () => {
    const sendMailSpied = jest.spyOn(fakeMailProvider, 'sendMail');
    const { email } = await fakeUserRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    await sendForgotPasswordMailService.execute(email);

    expect(sendMailSpied).toHaveBeenCalled();
    expect(sendMailSpied).toHaveBeenCalledTimes(1);
  });

  it('should be able to generate a forgot password token when received correct data', async () => {
    const generateTokenSpied = jest.spyOn(fakeUserTokensRepository, 'generate');
    const { id, email } = await fakeUserRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    await sendForgotPasswordMailService.execute(email);

    expect(generateTokenSpied).toBeCalledWith(id);
  });

  it('should not be able to recover the password when a non-existent user', async () => {
    await expect(
      sendForgotPasswordMailService.execute('joh@example.com'),
    ).rejects.toBeInstanceOf(AppError);
  });
});
