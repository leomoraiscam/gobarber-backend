import { AppError } from '@shared/errors/AppError';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { ShowUserProfileService } from './ShowUserProfileService';

describe('ShowUserProfileService', () => {
  let fakeUserRepository: FakeUserRepository;
  let showUserProfileService: ShowUserProfileService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    showUserProfileService = new ShowUserProfileService(fakeUserRepository);
  });

  it('should be able to show user when received correct data', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });
    const user = await showUserProfileService.execute(userId);

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('joh@example.com');
  });
});
