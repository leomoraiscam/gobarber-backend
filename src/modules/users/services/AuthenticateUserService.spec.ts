import { AppError } from '@shared/errors/AppError';
import { FakeHashProvider } from '@shared/container/providers/HashProvider/fakes/FakeHashProvider';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { AuthenticateUserService } from './AuthenticateUserService';

describe('AuthenticateUserService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeHashProvider: FakeHashProvider;
  let authenticateUserService: AuthenticateUserService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeHashProvider = new FakeHashProvider();
    authenticateUserService = new AuthenticateUserService(
      fakeUserRepository,
      fakeHashProvider,
    );
  });

  it('should be able to return token property to user when the same is authenticate with success', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password',
    });
    const response = await authenticateUserService.execute({
      email: 'joh@example.com',
      password: 'password',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });

  it('should not be able to authenticate user when the same a non existing user', async () => {
    expect(
      authenticateUserService.execute({
        email: 'joh@example.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate user when received wrong email', async () => {
    await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    expect(
      authenticateUserService.execute({
        email: 'wrong-email@example.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate user when received wrong password', async () => {
    await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password',
    });

    expect(
      authenticateUserService.execute({
        email: 'joh@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
