import { uuid as uuidV4 } from 'uuidv4';
import { IUserTokenRepository } from '@modules/users/repositories/IUserTokenRepository';
import { UserToken } from '../../infra/typeorm/entities/UserToken';

export class FakeUserTokenRepository implements IUserTokenRepository {
  private userTokens: UserToken[] = [];

  public async findByUserId(userId: string): Promise<UserToken | null> {
    return this.userTokens.find(userToken => userToken.userId === userId);
  }

  public async findByToken(token: string): Promise<UserToken | null> {
    return this.userTokens.find(userToken => userToken.token === token);
  }

  public async create(userId: string): Promise<UserToken> {
    const userToken = new UserToken();

    Object.assign(userToken, {
      id: uuidV4(),
      token: uuidV4(),
      userId,
      createdAt: new Date(),
      updatedAt: null,
    });

    this.userTokens.push(userToken);

    return userToken;
  }

  public async delete(token: string, userId: string): Promise<void> {
    this.userTokens = this.userTokens.filter(
      userToken => userToken.token !== token && userToken.userId !== userId,
    );
  }
}
