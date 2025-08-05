import { User } from './user';
import { Timestamp } from 'rxjs';
import { Case } from './case';

export type Comment = {
  id?: string;
  user: User;
  text: string;
  timestamp: string; // ISO string format: "2025-08-04T10:30:00.000Z"
  caseEntity: Case;
};
