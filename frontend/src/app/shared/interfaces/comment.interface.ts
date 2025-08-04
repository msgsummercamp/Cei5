import {User} from './user.interface';
import {Timestamp} from 'rxjs';
import {Case} from './case.interface';

export type Comment = {
  id?: string;
  user: User
  text: string;
  timestamp: Timestamp<any>;
  caseEntity: Case
}
