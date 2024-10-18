import { getRepository, Repository, Not } from 'typeorm';
import IUserRepository from '@modules/users/repositories/IUserRepository';
import { ICreateUserDTO } from '@modules/users/dtos/ICreateUserDTO';
import User from '../entities/User';

class UserRepository implements IUserRepository {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = getRepository(User);
  }

  public async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOne(id);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async findAllProviders(exceptUserId?: string): Promise<User[] | null> {
    let users: User[];

    if (exceptUserId) {
      users = await this.ormRepository.find({
        where: {
          id: Not(exceptUserId),
        },
      });
    } else {
      users = await this.ormRepository.find();
    }

    return users;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const { name, email, password } = data;
    const user = await this.ormRepository.create({
      name,
      email,
      password,
    });

    await this.ormRepository.save(user);

    return user;
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }
}

export default UserRepository;
