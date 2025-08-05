import { Role } from './role.enum';
import { UserDetails } from './userDetails';
import { Case } from './case';

export type User = {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  userDetails: UserDetails;
  comments?: Comment[];
  cases: Case[];
  isFirstLogin?: boolean;
};
