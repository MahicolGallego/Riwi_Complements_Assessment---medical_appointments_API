import { Role } from '../constants/roles.enum';

export interface IPayloadToken {
  sub: string;
  role: Role;
}
