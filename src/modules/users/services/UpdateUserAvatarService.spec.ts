import AppError from '@shared/errors/AppError';
import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { UpdateUserAvatarService } from './UpdateUserAvatarService';

describe('UpdateUserAvatarService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeStorageProvider: FakeStorageProvider;
  let userAvatarService: UpdateUserAvatarService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeStorageProvider = new FakeStorageProvider();
    userAvatarService = new UpdateUserAvatarService(
      fakeUserRepository,
      fakeStorageProvider,
    );
  });

  it('should be able to update avatar a user when received correct data', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    await userAvatarService.execute({
      userId: user.id,
      avatar: 'avatar.jpg',
    });

    expect(user.avatar).toBe('avatar.jpg');
  });

  it('should not be able to update avatar when a non-existing user', async () => {
    await expect(
      userAvatarService.execute({
        userId: 'non-existing-user',
        avatar: 'avatar.jpg',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to delete old avatar file when updating user avatar', async () => {
    const deleteFile = jest.spyOn(fakeStorageProvider, 'deleteFile');
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    await userAvatarService.execute({
      userId,
      avatar: 'avatar.jpg',
    });
    const user = await userAvatarService.execute({
      userId,
      avatar: 'avatar1.jpg',
    });

    expect(deleteFile).toHaveBeenCalledWith('avatar.jpg');
    expect(user.avatar).toBe('avatar1.jpg');
  });
});
