import { UserToken } from '../infra/typeorm/entities/UserToken';

export interface IUserTokenRepository {
  findByToken(token: string): Promise<UserToken | null>;
  create(userId: string): Promise<UserToken>;
}
