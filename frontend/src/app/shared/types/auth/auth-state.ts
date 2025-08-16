import { User } from '../user';

export type AuthState = {
  isAuthenticated: boolean;
  id: string;
  email: string;
  role: string;
  user: User;
};
