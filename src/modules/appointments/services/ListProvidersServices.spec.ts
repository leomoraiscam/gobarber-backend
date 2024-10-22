import AppError from '@shared/errors/AppError';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeUserRepository } from '../../users/repositories/fakes/FakeUserRepository';
import ListProvidersService from './ListProvidersServices';

let fakeUserRepository: FakeUserRepository;
let listProviders: ListProvidersService;
let fakeCacheProvider: FakeCacheProvider;

describe('List Providers', () => {
  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProviders = new ListProvidersService(
      fakeUserRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list the providers', async () => {
    const user01 = await fakeUserRepository.create({
      name: 'Jonh Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    const user02 = await fakeUserRepository.create({
      name: 'Jonh Tre',
      email: 'johtre@example.com',
      password: 'password@',
    });

    const loggedUser = await fakeUserRepository.create({
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
