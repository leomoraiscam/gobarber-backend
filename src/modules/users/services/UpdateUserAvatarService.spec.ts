import { AppError } from '@shared/errors/AppError';
import { FakeStorageProvider } from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';
import { FakeUserRepository } from '../repositories/fakes/FakeUserRepository';
import { UpdateUserAvatarService } from './UpdateUserAvatarService';

describe('UpdateUserAvatarService', () => {
  let fakeUserRepository: FakeUserRepository;
  let fakeStorageProvider: FakeStorageProvider;
  let updateUserAvatarService: UpdateUserAvatarService;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeStorageProvider = new FakeStorageProvider();
    updateUserAvatarService = new UpdateUserAvatarService(
      fakeUserRepository,
      fakeStorageProvider,
    );
  });

  it('should be able to update user avatar when received correct data', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    await updateUserAvatarService.execute({
      userId: user.id,
      avatar: 'avatar.jpg',
    });

    expect(user.avatar).toBe('avatar.jpg');
  });

  it('should not be able to update user avatar when the same a non existing', async () => {
    await expect(
      updateUserAvatarService.execute({
        userId: 'non-existing-user',
        avatar: 'avatar.jpg',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to delete old avatar file when updating user avatar', async () => {
    const deleteFileSpied = jest.spyOn(fakeStorageProvider, 'deleteFile');
    const { id: userId } = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    const [, updatedUser] = await Promise.all([
      updateUserAvatarService.execute({
        userId,
        avatar: 'avatar.jpg',
      }),
      updateUserAvatarService.execute({
        userId,
        avatar: 'avatar1.jpg',
      }),
    ]);

    expect(deleteFileSpied).toHaveBeenCalledWith('avatar.jpg');
    expect(updatedUser.avatar).toBe('avatar1.jpg');
  });
});
