import { injectable, inject } from 'tsyringe';
import { User } from '@modules/users/infra/typeorm/entities/User';
import { IUserRepository } from '../repositories/IUserRepository';

@injectable()
export class ShowUserProfileService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }
}
