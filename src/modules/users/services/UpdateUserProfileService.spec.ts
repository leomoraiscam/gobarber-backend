import AppError from '@shared/errors/AppError';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import FakeUserRepository from '../repositories/fakes/FakeUserRepository';
import UpdateUserProfileService from './UpdateUserProfileService';

describe('UpdateUserProfileService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeHashProvider: FakeHashProvider;
  let updateUserProfileService: UpdateUserProfileService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeHashProvider = new FakeHashProvider();
    updateUserProfileService = new UpdateUserProfileService(
      fakeUserRepository,
      fakeHashProvider,
    );
  });

  it('should be able to update user profile when received correct data', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });
    const updatedUser = await updateUserProfileService.execute({
      userId: user.id,
      name: 'Joe Smith',
      email: 'joe@example.com',
    });

    expect(updatedUser.name).toBe('Joe Smith');
    expect(updatedUser.email).toBe('joe@example.com');
  });

  it('should not be able to update profile when a non-existing user', async () => {
    await expect(
      updateUserProfileService.execute({
        userId: 'non-existing-user-id',
        name: 'test',
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to change user with same email from another user when the same already exits', async () => {
    await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });
    const user = await fakeUserRepository.create({
      name: 'Joe Smith',
      email: 'joe@example.com',
      password: 'password@',
    });

    await expect(
      updateUserProfileService.execute({
        userId: user.id,
        name: 'Brayn kick',
        email: 'joh@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update user profile when received password property', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });
    const updatedUser = await updateUserProfileService.execute({
      userId: user.id,
      name: 'Joe Smith',
      email: 'joe@example.com',
      oldPassword: '123456',
      password: '123123',
    });

    expect(updatedUser.password).toBe('123123');
  });

  it('should not be able to update the password when missing old password property', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId: user.id,
        name: 'Joe Smith',
        email: 'joe@example.com',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update the password when received wrong old password property', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId: user.id,
        name: 'Joe Smith',
        email: 'joe@example.com',
        oldPassword: 'wrong-old-password',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
