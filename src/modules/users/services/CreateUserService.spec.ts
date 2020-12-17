import AppError from '@shared/errors/AppError';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import CreateUserService from './CreateUserService';

describe('CreateUsers', () => {
  it('should be able to create a new user', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const createUser = new CreateUserService(fakeUsersRepository);

    const user = await createUser.execute({
      name: 'Jonh Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    expect(user).toHaveProperty('id');
  });

  it('should be able to create a new user with same email from another', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const createUser = new CreateUserService(fakeUsersRepository);

    await createUser.execute({
      name: 'Jonh Doe',
      email: 'joh@example.com',
      password: 'password@',
    });

    expect(
      createUser.execute({
        name: 'Jonh Doe',
        email: 'joh@example.com',
        password: 'password@',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
