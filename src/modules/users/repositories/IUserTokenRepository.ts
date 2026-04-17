import { UserToken } from '../infra/typeorm/entities/UserToken';

export interface IUserTokenRepository {
  findByToken(token: string): Promise<UserToken | null>;
  findByUserId(userId: string): Promise<UserToken | null>;
  create(userId: string): Promise<UserToken>;
  delete(token: string, userId: string): Promise<void>;
}
