import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeUserRepository } from '../../users/repositories/fakes/FakeUserRepository';
import ListProvidersService from './ListProvidersService';

describe('ListProvidersService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let listProvidersService: ListProvidersService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProvidersService = new ListProvidersService(
      fakeUserRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list the providers when received correct data', async () => {
    const [firstUser, secondUser, thirdUser] = await Promise.all([
      fakeUserRepository.create({
        name: 'Ronnie Dawson',
        email: 'teb@wazizin.ph',
        password: 'password@',
      }),
      fakeUserRepository.create({
        name: 'Myra Potter',
        email: 'sauva@jadimeb.lc',
        password: 'password@',
      }),
      fakeUserRepository.create({
        name: 'Brayan Kall',
        email: 'brayan@example.com',
        password: 'password@',
      }),
    ]);

    const providers = await listProvidersService.execute(thirdUser.id);

    expect(providers).toEqual([firstUser, secondUser]);
  });
});
