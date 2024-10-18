import { uuid as uuidV4 } from 'uuidv4';
import { IUserRepository } from '@modules/users/repositories/IUserRepository';
import { ICreateUserDTO } from '@modules/users/dtos/ICreateUserDTO';
import User from '../../infra/typeorm/entities/User';

export class FakeUserRepository implements IUserRepository {
  private users: User[] = [];

  public async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  public async findAllProviders(exceptUserId?: string): Promise<User[] | null> {
    let { users } = this;

    if (exceptUserId) {
      users = this.users.filter(user => user.id !== exceptUserId);
    }

    return users;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const { name, email, password } = data;
    const user = new User();

    Object.assign(user, {
      id: uuidV4(),
      name,
      email,
      password,
    });

    this.users.push(user);

    return user;
  }

  public async save(user: User): Promise<User> {
    const userIndex = this.users.findIndex(data => data.id === user.id);

    this.users[userIndex] = user;

    return user;
  }
}
