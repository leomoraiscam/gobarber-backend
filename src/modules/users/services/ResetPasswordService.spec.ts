import AppError from '@shared/errors/AppError';
import FakeUserTokenRepository from '../repositories/fakes/FakeUserTokenRepository';
import FakeUserRepository from '../repositories/fakes/FakeUserRepository';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import ResetPasswordService from './ResetPasswordService';

describe('ResetPasswordService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeUserTokenRepository: FakeUserTokenRepository;
  let fakeHashProvider: FakeHashProvider;
  let resetPasswordService: ResetPasswordService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeUserTokenRepository = new FakeUserTokenRepository();
    fakeHashProvider = new FakeHashProvider();
    resetPasswordService = new ResetPasswordService(
      fakeUserRepository,
      fakeUserTokenRepository,
      fakeHashProvider,
    );
  });

  it('should be able to reset password when received valid token', async () => {
    const generateHashSpied = jest.spyOn(fakeHashProvider, 'generateHash');
    const { id: userId } = await fakeUserRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });
    const { token } = await fakeUserTokenRepository.generate(userId);

    await resetPasswordService.execute({
      password: '123123',
      token,
    });

    expect(generateHashSpied).toHaveBeenCalledWith('123123');
  });

  it('should not be able to reset the password when a non-existing token', async () => {
    await expect(
      resetPasswordService.execute({
        token: 'non-existing-token',
        password: '12312345',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset the password when a non-existing user', async () => {
    const { token } = await fakeUserTokenRepository.generate(
      'non-existing-user',
    );

    await expect(
      resetPasswordService.execute({
        token,
        password: '12312345',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset password when passed more than 2 hours', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    const { id: userId } = await fakeUserRepository.create({
      name: 'john Doe',
      email: 'joh@example.com',
      password: 'password',
    });
    const { token } = await fakeUserTokenRepository.generate(userId);

    await expect(
      resetPasswordService.execute({
        password: '123123',
        token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
