import { AppError } from '@shared/errors/AppError';
import { FakeHashProvider } from '@shared/container/providers/HashProvider/fakes/FakeHashProvider';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { UpdateUserProfileService } from './UpdateUserProfileService';

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

  it('should be able to update user when received correct data', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });
    const updatedUser = await updateUserProfileService.execute({
      userId,
      name: 'Joe Smith',
      email: 'joe@example.com',
    });

    expect(updatedUser.name).toBe('Joe Smith');
    expect(updatedUser.email).toBe('joe@example.com');
  });

  it('should not be able to update user when received email that is already registered by another user', async () => {
    await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });
    const { id: userId } = await fakeUserRepository.create({
      name: 'Joe Smith',
      email: 'joe@example.com',
      password: 'password@',
    });

    await expect(
      updateUserProfileService.execute({
        userId,
        name: 'Brayn kick',
        email: 'joh@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update user password when received password', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });
    const updatedUser = await updateUserProfileService.execute({
      userId,
      name: 'Joe Smith',
      email: 'joe@example.com',
      oldPassword: '123456',
      password: '123123',
      passwordConfirmation: '123123',
    });

    expect(updatedUser.password).toBe('123123');
  });

  it('should not be able to update user password when confirmation password is different from the received password', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId,
        name: 'Joe Smith',
        email: 'joe@example.com',
        password: '123123',
        passwordConfirmation: '12312345',
        oldPassword: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update password when missing confirmation password property', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId,
        name: 'Joe Smith',
        email: 'joe@example.com',
        password: '123123',
        oldPassword: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update password when missing old password property', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId,
        name: 'Joe Smith',
        email: 'joe@example.com',
        password: '123123',
        passwordConfirmation: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update user password when received wrong old password property', async () => {
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: '123456',
    });

    await expect(
      updateUserProfileService.execute({
        userId,
        name: 'Joe Smith',
        email: 'joe@example.com',
        oldPassword: 'wrong-old-password',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
