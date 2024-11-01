import { injectable, inject } from 'tsyringe';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { classToClass } from 'class-transformer';
import { IUserRepository } from '../../users/repositories/IUserRepository';
import { User } from '../../users/infra/typeorm/entities/User';

@injectable()
class ListProvidersService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  async execute(userId: string): Promise<User[]> {
    let users = await this.cacheProvider.recover<User[]>(
      `providers-list:${userId}`,
    );

    if (!users) {
      users = await this.userRepository.findAllProviders(userId);

      await this.cacheProvider.save(
        `providers-list:${userId}`,
        classToClass(users),
      );
    }

    return users;
  }
}

export default ListProvidersService;
