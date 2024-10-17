import UserToken from '../infra/typeorm/entities/UserToken';

export default interface IUserTokenRepository {
  findByToken(token: string): Promise<UserToken | null>;
  generate(userId: string): Promise<UserToken>;
}
