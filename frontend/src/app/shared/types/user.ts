import { Roles } from './roles';
import { UserDetails } from './user-details';

export type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Roles;
  userDetails?: UserDetails;
  isFirstLogin?: boolean;
};
