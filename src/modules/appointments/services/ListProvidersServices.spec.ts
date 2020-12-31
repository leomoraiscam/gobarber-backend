import AppError from '@shared/errors/AppError';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeUsersRepository from '../../users/repositories/fakes/FakeUsersRepository';
import ListProvidersService from './ListProvidersServices';

let fakeUsersRepository: FakeUsersRepository;
let listProviders: ListProvidersService;
let fakeCacheProvider: FakeCacheProvider;

describe('List Providers', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProviders = new ListProvidersService(
      fakeUsersRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list the providers', async () => {
    const user01 = await fakeUsersRepository.create({
      name: 'Jonh Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    const user02 = await fakeUsersRepository.create({
      name: 'Jonh Tre',
      email: 'johtre@example.com',
      password: 'password@',
    });

    const loggedUser = await fakeUsersRepository.create({
      name: 'Brayan Kall',
      email: 'brayan@example.com',
      password: 'password@',
    });

    const providers = await listProviders.execute({
      user_id: loggedUser.id,
    });

    expect(providers).toEqual([user01, user02]);
  });
});
