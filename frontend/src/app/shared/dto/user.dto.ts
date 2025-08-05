import { Role } from '../enums/role.enum';
import { CaseDTO } from './case.dto';
export type UserDTO = {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  userDetails: {
    id?: string;
    phoneNumber: string;
    address: string;
    postalCode: string;
    birthDate: Date;
  };
  comments?: Comment[];
  cases?: CaseDTO[];
  isFirstLogin?: boolean;
};
