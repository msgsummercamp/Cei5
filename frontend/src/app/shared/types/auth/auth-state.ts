import { User } from '../user';

export type AuthState = {
  isAuthenticated: boolean;
  id: string;
  email: string;
  token: string;
  role: string;
  user: User;
};
