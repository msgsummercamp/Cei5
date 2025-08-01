import { Roles } from './roles';
import { UserDetails } from './user-details';

export type User = {
  id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Roles | null;
  userDetails: UserDetails | null;
  isFirstLogin: boolean | null;
};
