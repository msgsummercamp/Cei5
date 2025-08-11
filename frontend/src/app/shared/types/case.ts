import { Statuses } from './enums/status';
import { DisruptionReasons } from './enums/disruption-reason';
import { User } from './user';
import { Reservation } from './reservation';
import { Document } from './document';
import { Beneficiary } from './beneficiary';

export type Case = {
  id?: string;
  status?: Statuses;
  disruptionReason: DisruptionReasons;
  disruptionInfo: string;
  date: Date | null;
  client: User;
  assignedColleague?: User | null;
  reservation: Reservation;
  documentList?: Document[];
  beneficiary?: Beneficiary | null;
};
