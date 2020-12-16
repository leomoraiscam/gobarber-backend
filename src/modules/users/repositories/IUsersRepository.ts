import Users from '@modules/users/infra/typeorm/entities/User';
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO';
import User from '@modules/users/infra/typeorm/entities/User';

export default interface IUserRepository {
  findById(id: string): Promise<Users | undefined >;
  findByEmail(email: string): Promise<Users | undefined >;
  create(data: ICreateUserDTO): Promise<Users>;
  save(user: ICreateUserDTO): Promise<User>
}
