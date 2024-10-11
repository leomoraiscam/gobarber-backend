import AppError from '@shared/errors/AppError';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeUserRepository from '../repositories/fakes/FakeUserRepository';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import CreateUserService from './CreateUserService';

describe('CreateUserService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeHashProvider: FakeHashProvider;
  let fakeCacheProvider: FakeCacheProvider;
  let createUserService: CreateUserService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCacheProvider = new FakeCacheProvider();
    createUserService = new CreateUserService(
      fakeUserRepository,
      fakeHashProvider,
      fakeCacheProvider,
    );
  });

  it('should be able to create a new user when received correct data', async () => {
    const user = await createUserService.execute({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create user with same email from another user when the same already exits ', async () => {
    await createUserService.execute({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    expect(
      createUserService.execute({
        name: 'John Doe',
        email: 'joh@example.com',
        password: 'password@',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
