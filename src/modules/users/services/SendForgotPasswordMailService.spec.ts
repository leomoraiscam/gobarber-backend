import { AppError } from '@shared/errors/AppError';
import { FakeMailProvider } from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import { FakeUserTokenRepository } from '../repositories/fakes/FakeUserTokenRepository';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { SendForgotPasswordMailService } from './SendForgotPasswordMailService';

describe('SendForgotPasswordMailService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeUserTokenRepository: FakeUserTokenRepository;
  let fakeMailProvider: FakeMailProvider;
  let sendForgotPasswordMailService: SendForgotPasswordMailService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokenRepository = new FakeUserTokenRepository();
    sendForgotPasswordMailService = new SendForgotPasswordMailService(
      fakeUserRepository,
      fakeUserTokenRepository,
      fakeMailProvider,
    );
  });

  it('should be able to send password recovery email when receiving correct data', async () => {
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
    const createTokenSpied = jest.spyOn(fakeUserTokenRepository, 'create');
    const { id, email } = await fakeUserRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    await sendForgotPasswordMailService.execute(email);

    expect(createTokenSpied).toHaveBeenNthCalledWith(1, id);
  });

  it('should be able to send password recovery email when user a non exist', async () => {
    await expect(
      sendForgotPasswordMailService.execute('joh@example.com'),
    ).rejects.toBeInstanceOf(AppError);
  });
});
