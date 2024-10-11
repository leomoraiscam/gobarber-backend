import User from '@modules/users/infra/typeorm/entities/User';
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO';

export default interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAllProviders(exceptUserId?: string): Promise<User[] | null>;
  create(data: ICreateUserDTO): Promise<User>;
  save(user: ICreateUserDTO): Promise<User>;
}
