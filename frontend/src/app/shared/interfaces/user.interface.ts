import {Role} from '../enums/role.enum';
import {UserDetails} from './userDetails.interface';
import {Case} from './case.interface';

export interface User {
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
}
