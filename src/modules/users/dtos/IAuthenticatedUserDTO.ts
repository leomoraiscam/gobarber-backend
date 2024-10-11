import User from '../infra/typeorm/entities/User';

interface IAuthenticatedUserDTO {
  user: User;
  token: string;
}

export default IAuthenticatedUserDTO;
