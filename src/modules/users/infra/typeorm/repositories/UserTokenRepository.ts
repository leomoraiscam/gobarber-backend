import { getRepository, Repository } from 'typeorm';
import { IUserTokenRepository } from '@modules/users/repositories/IUserTokenRepository';
import { UserToken } from '../entities/UserToken';

export class UserTokenRepository implements IUserTokenRepository {
  private ormRepository: Repository<UserToken>;

  constructor() {
    this.ormRepository = getRepository(UserToken);
  }

  public async findByToken(token: string): Promise<UserToken | null> {
    return this.ormRepository.findOne({
      where: { token },
    });
  }

  public async generate(userId: string): Promise<UserToken> {
    const userToken = this.ormRepository.create({
      user_id: userId,
    });

    await this.ormRepository.save(userToken);

    return userToken;
  }
}
