import { User } from './user';
import { Beneficiary } from './beneficiary';

export type CaseFormUserData = {
  completedBy: User;
  completedFor: Beneficiary | null;
};
